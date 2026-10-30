import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  Span,
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
 * One type for valid and recovered classes: a recovered list item is a null
 * object of its item type (see `isRecovered`).
 */
export interface Class {
  name: { value: string; span: Span };
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

/** Null objects for the recovered positions. */
function nullClassVarDec({ recovery, span }: RecoveryPoint): ClassVarDec {
  return { varType: "field", type: { value: "", span }, names: [], recovery };
}

function nullSubroutine({ recovery, span }: RecoveryPoint): Subroutine {
  return {
    type: "function",
    name: { value: "", span },
    returnType: { value: "void", span },
    parameters: [],
    body: { varDecs: [], statements: [] },
    recovery,
  };
}

function nullVarDec({ recovery, span }: RecoveryPoint): VarDec {
  return { type: { value: "", span }, names: [], recovery };
}

function nullStatement({ recovery, span }: RecoveryPoint): Statement {
  return { statementType: "returnStatement", span, recovery };
}

/**
 * A block's statements: the kept statements, then the correction slot's
 * null statement when the block recovered. The guarded list retains its
 * successfully matched statements.
 */
function block(list: Node, correction: Node): Statement[] {
  const kept: Statement[] = list.children.map((n) => n.statement);
  const recovered: RecoveryPoint | undefined = correction.recovery;
  return recovered ? [...kept, nullStatement(recovered)] : kept;
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

/** Drops recovered items from every list; the result is checked and minted `Valid`. */
export const prune = makePrune<Class>((tree) => ({
  ...tree,
  varDecs: keep(tree.varDecs),
  subroutines: keep(tree.subroutines).map((sub) => ({
    ...sub,
    body: {
      varDecs: keep(sub.body.varDecs),
      statements: pruneStatements(sub.body.statements),
    },
  })),
}));

jackSemantics.addAttribute<Class>("Root", {
  Root(_) {
    return this.class;
  },
});

jackSemantics.addAttribute<Class>("class", {
  Class(_a, name, _b, varDecs, subroutines, correction, _close) {
    const kept = subroutines.children.map((n) => n.subroutineDec);
    // Skipped text after the subroutines becomes a null subroutine; a class
    // that only lacks its `}` keeps its subroutines as they are.
    const recovered: RecoveryPoint | undefined = correction.recovery;
    const skipped =
      recovered && correction.sourceString.length > 0 ? recovered : undefined;
    return {
      name: { value: name.sourceString, span: span(name.source) },
      varDecs: varDecs.children.map((n) => n.classVarDec),
      subroutines: skipped ? [...kept, nullSubroutine(skipped)] : kept,
    };
  },
});

jackSemantics.addAttribute<ClassVarDec>("classVarDec", {
  ClassVarDec(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
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
  SubroutineDec(head, correction, _open, body) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      head,
      correction,
    );
    if (recovered) {
      return nullSubroutine(recovered);
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
  SubroutineBody(_a, varDecs, statementList, correction, _end) {
    return {
      varDecs: varDecs.children.map((n) => n.varDec),
      statements: block(statementList, correction),
    };
  },
});

jackSemantics.addAttribute<VarDec>("varDec", {
  VarDec(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
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

jackSemantics.addAttribute<Statement>("statement", {
  LetStatement(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    return recovered
      ? nullStatement(recovered)
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

  IfStatement(head, correction, _open, body, bodyCorrection, _end, elseBlock) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      head,
      correction,
    );
    if (recovered) {
      return nullStatement(recovered);
    }
    return {
      statementType: "ifStatement",
      condition: head.child(2).expression,
      body: block(body, bodyCorrection),
      else: elseBlock.child(0)?.else ?? [],
    };
  },

  WhileStatement(head, correction, _open, body, bodyCorrection, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      head,
      correction,
    );
    if (recovered) {
      return nullStatement(recovered);
    }
    return {
      statementType: "whileStatement",
      condition: head.child(2).expression,
      body: block(body, bodyCorrection),
    };
  },

  DoStatement(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    return recovered ? nullStatement(recovered) : body.statement;
  },

  DoBody(_a, call) {
    return { statementType: "doStatement", call: call.term as SubroutineCall };
  },

  ReturnStatement(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
    return recovered
      ? nullStatement(recovered)
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
    return block(body, bodyCorrection);
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

export const JACK = {
  parser: grammar,
  grammar: jackGrammar,
  semantics: jackSemantics,
  ...makeParser<Class>(grammar, jackSemantics, emptyClass, "class"),
};
