import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  carrierOf,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  type SyntaxExpected,
  span,
} from "./base.js";
import { Span } from "./diagnostic.js";
import jackGrammar from "./grammars/jack.ohm.js";

const primitives = new Set(["int", "boolean", "char"] as const);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;

export function isPrimitive(value: string): value is Primitive {
  return primitives.has(value as Primitive);
}

export type Type = Primitive | string;

export interface ClassName extends Recovery {
  value: string;
  span: Span;
}

/** Raw ASTs can contain placeholders identified by `isRecovered`; prune before use. */
export interface Class {
  name: ClassName;
  varDecs: ClassVarDec[];
  subroutines: Subroutine[];
}

export type ClassVarType = "static" | "field";

export interface ClassVarDec extends Recovery {
  varType: ClassVarType;
  type: { value: Type; span: Span };
  names: string[];
}

export interface Parameter {
  type: { value: Type; span: Span };
  name: string;
}

export type ReturnType = Type | "void";
export type SubroutineType = "constructor" | "function" | "method";

export interface Subroutine extends Recovery {
  type: SubroutineType;
  name: { value: string; span: Span };
  returnType: { value: ReturnType; span: Span };
  parameters: Parameter[];
  body: SubroutineBody;
}

export interface SubroutineBody {
  varDecs: VarDec[];
  statements: Statement[];
}

export interface VarDec extends Recovery {
  type: { value: Type; span: Span };
  names: string[];
}

/**
 * A recovered statement reuses `ReturnStatement` with no value as its null
 * object, because it is the only member whose fields need no expression.
 */
export type Statement =
  | LetStatement
  | IfStatement
  | WhileStatement
  | DoStatement
  | ReturnStatement;

export interface LetStatement extends Recovery {
  statementType: "letStatement";
  name: { value: string; span: Span };
  arrayIndex?: Expression;
  value: Expression;
  span: Span;
}

export interface IfStatement extends Recovery {
  statementType: "ifStatement";
  condition: Expression;
  body: Statement[];
  else: Statement[];
}

export interface WhileStatement extends Recovery {
  statementType: "whileStatement";
  condition: Expression;
  body: Statement[];
}

export interface DoStatement extends Recovery {
  statementType: "doStatement";
  call: SubroutineCall;
}

export interface ReturnStatement extends Recovery {
  statementType: "returnStatement";
  value?: Expression;
  span: Span;
}

export type Op = "+" | "-" | "*" | "/" | "&" | "|" | "<" | ">" | "=";
export type KeywordConstant = "true" | "false" | "null" | "this";
export type UnaryOp = "-" | "~";

export type Term =
  | NumericLiteral
  | StringLiteral
  | Variable
  | KeywordLiteral
  | SubroutineCall
  | ArrayAccess
  | GroupedExpression
  | UnaryExpression;

export interface NumericLiteral {
  termType: "numericLiteral";
  value: number;
}

export interface StringLiteral {
  termType: "stringLiteral";
  value: string;
}

export interface KeywordLiteral {
  termType: "keywordLiteral";
  value: KeywordConstant;
}

export interface Variable {
  termType: "variable";
  name: string;
  span: Span;
}

export interface GroupedExpression {
  termType: "groupedExpression";
  expression: Expression;
}

export interface UnaryExpression {
  termType: "unaryExpression";
  op: UnaryOp;
  term: Term;
}

export interface ArrayAccess {
  termType: "arrayAccess";
  name: { value: string; span: Span };
  index: Expression;
  span: Span;
}

export interface SubroutineCall {
  termType: "subroutineCall";
  name: { value: string; span: Span };
  span: Span;
  parameters: Expression[];
}

export interface ExpressionPart {
  op: Op;
  term: Term;
}

export interface Expression {
  term: Term;
  rest: ExpressionPart[];
}

export const grammar = ohmGrammar(jackGrammar, grammars);
export const jackSemantics = grammar.extendSemantics(baseSemantics);

export type JackSkipKind =
  | "ClassHead"
  | "ClassStart"
  | "ClassVarDecBody"
  | "SubroutineHead"
  | "ClassClose"
  | "MissingClassClose"
  | "VarDecBody"
  | "LetBody"
  | "DoBody"
  | "ReturnBody"
  | "IfHead"
  | "WhileHead"
  | "SubroutineBodyClose"
  | "IfClose"
  | "ElseClose"
  | "WhileClose";

type StatementSkipKind = Exclude<
  JackSkipKind,
  | "ClassHead"
  | "ClassStart"
  | "ClassVarDecBody"
  | "SubroutineHead"
  | "ClassClose"
  | "MissingClassClose"
  | "VarDecBody"
>;
type BlockCloseKind =
  | "SubroutineBodyClose"
  | "IfClose"
  | "ElseClose"
  | "WhileClose";

function nullName(
  point: RecoveryPoint,
  kind: "ClassHead" | "ClassStart",
): ClassName {
  return { value: "", span: point.span, ...carrierOf(point, kind) };
}

function nullClassVarDec(point: RecoveryPoint): ClassVarDec {
  return {
    varType: "field",
    type: { value: "", span: point.span },
    names: [],
    ...carrierOf(point, "ClassVarDecBody"),
  };
}

function nullSubroutine(
  point: RecoveryPoint,
  kind: "SubroutineHead" | "ClassClose" | "MissingClassClose",
): Subroutine {
  const { span } = point;
  return {
    type: "function",
    name: { value: "", span },
    returnType: { value: "void", span },
    parameters: [],
    body: { varDecs: [], statements: [] },
    ...carrierOf(point, kind),
  };
}

function nullVarDec(point: RecoveryPoint): VarDec {
  return {
    type: { value: "", span: point.span },
    names: [],
    ...carrierOf(point, "VarDecBody"),
  };
}

function nullStatement(
  point: RecoveryPoint,
  kind: StatementSkipKind,
): Statement {
  return {
    statementType: "returnStatement",
    span: point.span,
    ...carrierOf(point, kind),
  };
}

/**
 * A block's statements: the kept statements, then the correction slot's
 * null statement when the block recovered. The guarded list retains its
 * successfully matched statements.
 */
function block(
  list: Node,
  correction: Node,
  kind: BlockCloseKind,
): Statement[] {
  const kept: Statement[] = list.children.map((n) => n.statement);
  const recovered: RecoveryPoint | undefined = correction.recovery;
  return recovered ? [...kept, nullStatement(recovered, kind)] : kept;
}

const keep = <T extends Recovery>(items: T[]): T[] =>
  items.filter((item) => !isRecovered(item));

function pruneStatements(statements: Statement[]): Statement[] {
  return keep(statements).map((statement) => {
    switch (statement.statementType) {
      case "ifStatement":
        return {
          ...statement,
          body: pruneStatements(statement.body),
          else: pruneStatements(statement.else),
        };
      case "whileStatement":
        return { ...statement, body: pruneStatements(statement.body) };
      default:
        return statement;
    }
  });
}

function scopeOf(node: object): string | undefined {
  return "subroutines" in node || "parameters" in node
    ? (node as Class | Subroutine).name.value
    : undefined;
}

export const prune = makePrune<Class>(
  (tree) => ({
    ...tree,
    name: isRecovered(tree.name)
      ? { value: "", span: tree.name.span }
      : tree.name,
    varDecs: keep(tree.varDecs),
    subroutines: keep(tree.subroutines).map((sub) => ({
      ...sub,
      body: {
        varDecs: keep(sub.body.varDecs),
        statements: pruneStatements(sub.body.statements),
      },
    })),
  }),
  scopeOf,
);

jackSemantics.addAttribute<Class>("Root", {
  Root(_) {
    return this.class;
  },
});

jackSemantics.addAttribute<ClassName>("className", {
  ClassOpen(keyword, name, correction, _open) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      keyword,
      correction,
    );
    return recovered
      ? nullName(recovered, "ClassHead")
      : {
          value: name.sourceString,
          span: span(name.source),
        };
  },
});

function classCloser(correction: Node): Subroutine[] {
  const recovered: RecoveryPoint | undefined = correction.recovery;
  if (recovered === undefined) return [];
  return [nullSubroutine(recovered, "ClassClose")];
}

jackSemantics.addAttribute<Class>("class", {
  Class_body(
    open,
    varDecs,
    headerCorrection,
    _subroutinesStart,
    subroutines,
    correction,
    _close,
  ) {
    const header: RecoveryPoint | undefined = guardedRecovery(
      open,
      headerCorrection,
    );
    const kept = subroutines.children.map((n) => n.subroutineDec);
    return {
      ...(header
        ? { name: nullName(header, "ClassStart"), varDecs: [] }
        : {
            name: open.className,
            varDecs: varDecs.children.map((n) => n.classVarDec),
          }),
      subroutines: [...kept, ...classCloser(correction)],
    };
  },
  Class_unclosed(_class, open, varDecs, correction, _close) {
    return {
      name: open.className,
      varDecs: varDecs.children.map((n) => n.classVarDec),
      subroutines: classCloser(correction),
    };
  },
});

jackSemantics.addAttribute<ClassVarDec>("classVarDec", {
  ClassVarDec(varType, type, name, rest, correction, _end) {
    const recovered = guardedRecovery(varType, correction);
    if (recovered) return nullClassVarDec(recovered);
    return {
      varType: varType.sourceString.trim() as ClassVarType,
      type: {
        value: type.sourceString.trim() as Type,
        span: span(type.source),
      },
      names: [
        name.sourceString,
        ...rest.children.map((n) => n.child(1).sourceString),
      ],
    };
  },
});

jackSemantics.addAttribute<Subroutine>("subroutineDec", {
  SubroutineDec(
    type,
    returnType,
    name,
    _a,
    parameters,
    _b,
    correction,
    _open,
    body,
  ) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      type,
      correction,
    );
    if (recovered) {
      return nullSubroutine(recovered, "SubroutineHead");
    }
    return {
      type: type.sourceString.trim() as SubroutineType,
      returnType: {
        value: returnType.sourceString.trim() as ReturnType,
        span: span(returnType.source),
      },
      name: { value: name.sourceString, span: span(name.source) },
      parameters: parameters.parameterList,
      body: body.subroutineBody,
    };
  },
});

jackSemantics.addAttribute<Parameter>("parameter", {
  Parameter(type, name) {
    return {
      type: {
        value: type.sourceString.trim() as Type,
        span: span(type.source),
      },
      name: name.sourceString,
    };
  },
});

jackSemantics.addAttribute<Expression[]>("parameterList", {
  ParameterList(node) {
    return node.child(0)?.parameters ?? [];
  },
});

jackSemantics.addAttribute<Expression[]>("parameters", {
  Parameters(first, rest) {
    return [first.parameter, ...rest.children.map((n) => n.child(1).parameter)];
  },
});

jackSemantics.addAttribute<SubroutineBody>("subroutineBody", {
  SubroutineBody(_a, varDecs, statementList, correction, _end) {
    return {
      varDecs: varDecs.children.map((n) => n.varDec),
      statements: block(statementList, correction, "SubroutineBodyClose"),
    };
  },
});

jackSemantics.addAttribute<VarDec>("varDec", {
  VarDec(_a, type, name, rest, correction, _end) {
    const recovered = guardedRecovery(_a, correction);
    if (recovered) return nullVarDec(recovered);
    return {
      type: {
        value: type.sourceString.trim() as Type,
        span: span(type.source),
      },
      names: [
        name.sourceString,
        ...rest.children.map((n) => n.child(1).sourceString),
      ],
    };
  },
});

jackSemantics.addAttribute<Statement>("statement", {
  LetStatement(keyword, target, _equal, value, correction, _end) {
    const recovered = guardedRecovery(keyword, correction);
    if (recovered) return nullStatement(recovered, "LetBody");
    if (target.term.termType == "variable") {
      return {
        statementType: "letStatement",
        name: {
          value: (target.term as Variable).name,
          span: (target.term as Variable).span,
        },
        value: value.expression,
        span: span(this.source),
      };
    } else {
      return {
        statementType: "letStatement",
        name: (target.term as ArrayAccess).name,
        arrayIndex: (target.term as ArrayAccess).index,
        value: value.expression,
        span: span(this.source),
      };
    }
  },

  IfStatement(
    keyword,
    _paren,
    condition,
    _closeParen,
    correction,
    _open,
    body,
    bodyCorrection,
    _end,
    elseBlock,
  ) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      keyword,
      correction,
    );
    if (recovered) {
      return nullStatement(recovered, "IfHead");
    }
    return {
      statementType: "ifStatement",
      condition: condition.expression,
      body: block(body, bodyCorrection, "IfClose"),
      else: elseBlock.child(0)?.else ?? [],
    };
  },

  WhileStatement(
    keyword,
    _paren,
    condition,
    _closeParen,
    correction,
    _open,
    body,
    bodyCorrection,
    _end,
  ) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      keyword,
      correction,
    );
    if (recovered) {
      return nullStatement(recovered, "WhileHead");
    }
    return {
      statementType: "whileStatement",
      condition: condition.expression,
      body: block(body, bodyCorrection, "WhileClose"),
    };
  },

  DoStatement(keyword, call, correction, _end) {
    const recovered = guardedRecovery(keyword, correction);
    return recovered
      ? nullStatement(recovered, "DoBody")
      : { statementType: "doStatement", call: call.term as SubroutineCall };
  },

  ReturnStatement(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    return recovered
      ? nullStatement(recovered, "ReturnBody")
      : { ...body.statement, span: span(this.source) };
  },

  EmptyReturn(_a) {
    return {
      statementType: "returnStatement",
      span: span(this.source),
    };
  },

  ReturnValue(_a, value) {
    return {
      statementType: "returnStatement",
      value: value.expression,
      span: span(this.source),
    };
  },
});

jackSemantics.addAttribute<Statement[]>("else", {
  ElseBlock(_a, _b, body, bodyCorrection, _end) {
    return block(body, bodyCorrection, "ElseClose");
  },
});

jackSemantics.addAttribute<Term>("term", {
  integerConstant(node) {
    return {
      termType: "numericLiteral",
      value: Number(node.sourceString),
    };
  },

  stringConstant(_a, _b, _c) {
    return { termType: "stringLiteral", value: this.sourceString.slice(1, -1) };
  },

  keywordConstant(_) {
    return {
      termType: "keywordLiteral",
      value: this.sourceString as KeywordConstant,
    };
  },

  SubroutineCall(name, _a, expressions, _b) {
    return {
      termType: "subroutineCall",
      name: { value: name.sourceString, span: span(name.source) },
      parameters: expressions.expressionList,
      span: span(this.source),
    };
  },

  ArrayAccess(start, index, _) {
    const name = start.child(0);
    return {
      termType: "arrayAccess",
      name: { value: name.sourceString, span: span(name.source) },
      index: index.expression,
      span: span(this.source),
    };
  },

  jackIdentifier(first, rest) {
    return {
      termType: "variable",
      name: `${first.sourceString}${rest.sourceString}`,
      span: span(this.source),
    };
  },

  GroupedExpression(_a, expression, _b) {
    return {
      termType: "groupedExpression",
      expression: expression.expression,
    };
  },

  UnaryExpression(op, term) {
    return {
      termType: "unaryExpression",
      op: op.sourceString as UnaryOp,
      term: term.term,
    };
  },
});

jackSemantics.addAttribute<Expression[]>("expressionList", {
  ExpressionList(node) {
    return node.child(0)?.expressions ?? [];
  },
});

jackSemantics.addAttribute<Expression[]>("expressions", {
  Expressions(first, rest) {
    return [
      first.expression,
      ...rest.children.map((n) => n.child(1).expression),
    ];
  },
});

jackSemantics.addAttribute<Expression>("expression", {
  Expression(first, rest) {
    return {
      nodeType: "expression",
      term: first.term,
      rest: rest.children.map((n) => n.expressionPart),
    };
  },
});

jackSemantics.addAttribute<ExpressionPart>("expressionPart", {
  ExpressionPart(op, term) {
    return {
      op: op.sourceString as Op,
      term: term.term,
    };
  },
});

/** The null root of a parse that built no class: an empty, unnamed class. */
function emptyClass(): Class {
  return {
    name: { value: "", span: { start: 0, end: 0, line: 1 } },
    varDecs: [],
    subroutines: [],
  };
}

const LOOKAHEAD_EXPECTED = ['"}"', '"method"', '"function"', '"constructor"'];

/**
 * Replaces the subroutine-lookahead expectations after ClassVarDec* with "}".
 * Trying another `field` declaration can fail while ClassVarDec* succeeds by
 * stopping at that same position, including with no declarations. Ohm marks
 * that failed expectation with isFluffy() and omits it from normal messages.
 * We inspect it to recognize where class-variable parsing stopped.
 *
 * This changes the message only; EOF must not become a recovery join.
 */
const restoreClassClose: SyntaxExpected = (expected, failures) => {
  const afterClassVariables = failures.some(
    (failure) => failure.isFluffy() && failure.toString() === '"field"',
  );
  const tail = expected.length - LOOKAHEAD_EXPECTED.length;
  const endsWithLookahead =
    tail >= 0 &&
    LOOKAHEAD_EXPECTED.every((item, i) => expected[tail + i] === item);
  return afterClassVariables && endsWithLookahead
    ? [...expected.slice(0, tail), '"}"']
    : expected;
};

export const JACK = {
  parser: grammar,
  grammar: jackGrammar,
  semantics: jackSemantics,
  ...makeParser<Class>(
    grammar,
    jackSemantics,
    emptyClass,
    "class",
    restoreClassClose,
  ),
};
