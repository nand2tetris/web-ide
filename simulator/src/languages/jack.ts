import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  carrierOf,
  grammars,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  Span,
  type SyntaxMessage,
  span,
} from "./base.js";
import jackGrammar from "./grammars/jack.ohm.js";

const primitives = new Set(["int", "boolean", "char"] as const);
export type Primitive = typeof primitives extends Set<infer S> ? S : never;

export function isPrimitive(value: string): value is Primitive {
  return primitives.has(value as Primitive);
}

export type Type = Primitive | string;

/**
 * A class's name. A recovered class header leaves a null name: its value is
 * empty and it stands in for the skipped header.
 */
export interface ClassName extends Recovery {
  value: string;
  span: Span;
}

/**
 * One type for valid and recovered classes: a recovered list item is a null
 * object of its item type (see `isRecovered`).
 */
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

/**
 * What a Jack null object stands in for, by the grammar slot that recovered:
 * a skipped class header before its `{`, a skipped header with the class
 * variables before the first subroutine, a skipped declaration body or
 * subroutine header, skipped input before the class closer, a skipped
 * statement body or head, or the missing or skipped closer of a block.
 */
export type JackSkipKind =
  | "ClassHead"
  | "ClassStart"
  | "ClassVarDecBody"
  | "SubroutineHead"
  | "ClassClose"
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
  | "VarDecBody"
>;
type BlockCloseKind =
  | "SubroutineBodyClose"
  | "IfClose"
  | "ElseClose"
  | "WhileClose";

/** Null objects for the recovered positions. */
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
  kind: "SubroutineHead" | "ClassClose",
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
 * A block's statements: the kept statements, then the synchronizer slot's
 * null statement when the block recovered. A recovered list slot is an empty
 * placeholder with no children.
 */
function block(list: Node, end: Node, kind: BlockCloseKind): Statement[] {
  const kept: Statement[] = list.children.map((n) => n.statement);
  const recovered: RecoveryPoint | undefined = end.recovery;
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

/** A class and each subroutine open a scope named for them. */
function scopeOf(node: object): string | undefined {
  return "subroutines" in node || "parameters" in node
    ? (node as Class | Subroutine).name.value
    : undefined;
}

/**
 * Drops recovered items from every list; the result is checked and minted
 * `Valid`. Its provenance scopes each skip by its class and subroutine.
 */
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

/** A class's name and variables, or the null name of a skipped header. */
type ClassStart = Pick<Class, "name" | "varDecs">;

jackSemantics.addAttribute<ClassStart>("classStart", {
  ClassStart(head, open, varDecs) {
    const recovered: RecoveryPoint | undefined = open.recovery;
    return {
      name: recovered
        ? nullName(recovered, "ClassHead")
        : {
            value: head.child(1).sourceString,
            span: span(head.child(1).source),
          },
      varDecs: varDecs.children.map((n) => n.classVarDec),
    };
  },
});

jackSemantics.addAttribute<Class>("class", {
  Class(start, subroutinesStart, subroutines, close) {
    const header: RecoveryPoint | undefined = subroutinesStart.recovery;
    const kept = subroutines.children.map((n) => n.subroutineDec);
    // Skipped text after the subroutines becomes a null subroutine; a class
    // that only lacks its `}` keeps its subroutines as they are.
    const recovered: RecoveryPoint | undefined = close.recovery;
    const skipped =
      recovered && close.sourceString.length > 0 ? recovered : undefined;
    return {
      ...(header
        ? { name: nullName(header, "ClassStart"), varDecs: [] }
        : (start.classStart as ClassStart)),
      subroutines: skipped
        ? [...kept, nullSubroutine(skipped, "ClassClose")]
        : kept,
    };
  },
});

jackSemantics.addAttribute<ClassVarDec>("classVarDec", {
  ClassVarDec(body, end) {
    const recovered: RecoveryPoint | undefined = end.recovery;
    return recovered ? nullClassVarDec(recovered) : body.classVarDec;
  },
  ClassVarDecBody(varType, type, name, rest) {
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
  SubroutineDec(head, open, body) {
    const recovered: RecoveryPoint | undefined = open.recovery;
    if (recovered) {
      return nullSubroutine(recovered, "SubroutineHead");
    }
    const [type, returnType, name, _a, parameters] = head.children;
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
  SubroutineBody(_a, varDecs, statementList, end) {
    return {
      varDecs: varDecs.children.map((n) => n.varDec),
      statements: block(statementList, end, "SubroutineBodyClose"),
    };
  },
});

jackSemantics.addAttribute<VarDec>("varDec", {
  VarDec(body, end) {
    const recovered: RecoveryPoint | undefined = end.recovery;
    return recovered ? nullVarDec(recovered) : body.varDec;
  },
  VarDecBody(_a, type, name, rest) {
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

// jackSemantics.addAttribute<string | ArrayAccess>("letTarget", {
//   LetTarget() {
//     jackI
//   }
// })

jackSemantics.addAttribute<Statement>("statement", {
  LetStatement(body, end) {
    const recovered: RecoveryPoint | undefined = end.recovery;
    return recovered
      ? nullStatement(recovered, "LetBody")
      : { ...body.statement, span: span(this.source) };
  },

  LetBody(_a, target, _b, value) {
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

  IfStatement(head, open, body, end, elseBlock) {
    const recovered: RecoveryPoint | undefined = open.recovery;
    if (recovered) {
      return nullStatement(recovered, "IfHead");
    }
    return {
      statementType: "ifStatement",
      condition: head.child(2).expression,
      body: block(body, end, "IfClose"),
      else: elseBlock.child(0)?.else ?? [],
    };
  },

  WhileStatement(head, open, body, end) {
    const recovered: RecoveryPoint | undefined = open.recovery;
    if (recovered) {
      return nullStatement(recovered, "WhileHead");
    }
    return {
      statementType: "whileStatement",
      condition: head.child(2).expression,
      body: block(body, end, "WhileClose"),
    };
  },

  DoStatement(body, end) {
    const recovered: RecoveryPoint | undefined = end.recovery;
    return recovered ? nullStatement(recovered, "DoBody") : body.statement;
  },

  DoBody(_a, call) {
    return { statementType: "doStatement", call: call.term as SubroutineCall };
  },

  ReturnStatement(body, end) {
    const recovered: RecoveryPoint | undefined = end.recovery;
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
  ElseBlock(_a, _b, body, end) {
    return block(body, end, "ElseClose");
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

// ---------------------------------------------------------------------------
// Restored message: `expected "}"` right after a class's variables.
//
// What changed: `Class = ClassStart ! &SubroutinesStart ...` checks for a
// subroutine keyword or `}` where the class's variables end. Where they end
// exactly at the failure (no space or comment between, as in `class Main {`
// or `field int x;` at the end of the file), that lookahead adds `"method"`,
// `"function"` and `"constructor"` to the expected text. Before it, those
// expectations came from `SubroutineDec*`, which matched nothing there, so
// Ohm marked them fluffy and showed only `expected "}"`. Fluffy `"field"`
// failures (the variables' own `ClassVarDec*` ended there) mark the case.
//
// Tradeoff: accepting the end of input in the lookahead's join would also
// keep this text, but every recovery scan that reaches the end would then
// match it, so nearly every truncated Jack file would recover as an empty
// class instead of reaching its own recovery of a missing `}`.
//
// To revert to the longer list: delete this block and the
// `restoreClassCloseMessage` argument to `makeParser` below, and change the
// literal `expected "}"` in the test "the strict Jack message at a class
// with no subroutines" (`recovery/headers.test.ts`) to
// `expected "}", "method", "function", or "constructor"`.
const LOOKAHEAD_EXPECTED =
  'expected "}", "method", "function", or "constructor"';
const CLOSER_EXPECTED = 'expected "}"';

export const restoreClassCloseMessage: SyntaxMessage = (message, failures) => {
  const afterClassVariables = failures.some(
    (failure) => failure.isFluffy() && failure.toString() === '"field"',
  );
  return afterClassVariables && message.endsWith(LOOKAHEAD_EXPECTED)
    ? message.slice(0, -LOOKAHEAD_EXPECTED.length) + CLOSER_EXPECTED
    : message;
};
// ---------------------------------------------------------------------------

export const JACK = {
  parser: grammar,
  grammar: jackGrammar,
  semantics: jackSemantics,
  ...makeParser<Class>(
    grammar,
    jackSemantics,
    emptyClass,
    "class",
    restoreClassCloseMessage,
  ),
};
