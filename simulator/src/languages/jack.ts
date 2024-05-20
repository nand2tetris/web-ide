import ohm from "ohm-js";
import { Span, baseSemantics, grammars, makeParser, span } from "./base.js";
import jackGrammar from "./grammars/jack.ohm.js";

const primitives = new Set(["int", "boolean", "char"] as const);

export type Primitive = typeof primitives extends Set<infer S> ? S : never;

export function isPrimitive(value: string): value is Primitive {
  return primitives.has(value as Primitive);
}

export type Type = Primitive | string;

export interface Class {
  name: { value: string; span: Span };
  varDecs: ClassVarDec[];
  subroutines: Subroutine[];
}

export type ClassVarType = "static" | "field";

export interface ClassVarDec {
  varType: ClassVarType;
  type: Type;
  names: string[];
}

export interface Parameter {
  type: Type;
  name: string;
}

export type ReturnType = Type | "void";
export type SubroutineType = "constructor" | "function" | "method";

export interface Subroutine {
  type: SubroutineType;
  name: { value: string; span: Span };
  returnType: ReturnType;
  parameters: Parameter[];
  body: SubroutineBody;
}

export interface SubroutineBody {
  varDecs: VarDec[];
  statements: Statement[];
}

export interface VarDec {
  type: Type;
  names: string[];
}

export type Statement =
  | LetStatement
  | IfStatement
  | WhileStatement
  | DoStatement
  | ReturnStatement;

export interface LetStatement {
  statementType: "letStatement";
  name: { value: string; span: Span };
  arrayIndex?: Expression;
  value: Expression;
  span: Span;
}

export interface IfStatement {
  statementType: "ifStatement";
  condition: Expression;
  body: Statement[];
  else: Statement[];
}

export interface WhileStatement {
  statementType: "whileStatement";
  condition: Expression;
  body: Statement[];
}

export interface DoStatement {
  statementType: "doStatement";
  call: SubroutineCall;
}

export interface ReturnStatement {
  statementType: "returnStatement";
  value?: Expression;
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

export const grammar = ohm.grammar(jackGrammar, grammars);
export const jackSemantics = grammar.extendSemantics(baseSemantics);

function statements(node: ohm.Node) {
  return node.children.map((n) => n.statement);
}

jackSemantics.addAttribute<Class>("Root", {
  Root(_) {
    return this.class;
  },
});

jackSemantics.addAttribute<Class>("class", {
  Class(_a, name, _b, varDecs, subroutines, _c) {
    return {
      name: { value: name.sourceString, span: span(name.source) },
      varDecs: varDecs.children.map((n) => n.classVarDec),
      subroutines: subroutines.children.map((n) => n.subroutineDec),
    };
  },
});

jackSemantics.addAttribute<ClassVarDec>("classVarDec", {
  ClassVarDec(varType, type, name, rest, _) {
    return {
      varType: varType.sourceString.trim() as ClassVarType,
      type: type.sourceString.trim() as Type,
      names: [
        name.sourceString,
        ...rest.children.map((n) => n.child(1).sourceString),
      ],
    };
  },
});

jackSemantics.addAttribute<Subroutine>("subroutineDec", {
  SubroutineDec(type, returnType, name, _a, parameters, _b, body) {
    return {
      type: type.sourceString.trim() as SubroutineType,
      returnType: returnType.sourceString.trim() as ReturnType,
      name: { value: name.sourceString, span: span(name.source) },
      parameters: parameters.parameterList,
      body: body.subroutineBody,
    };
  },
});

jackSemantics.addAttribute<Parameter>("parameter", {
  Parameter(type, name) {
    return {
      type: type.sourceString.trim() as Type,
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
  SubroutineBody(_a, varDecs, statementList, _b) {
    return {
      varDecs: varDecs.children.map((n) => n.varDec),
      statements: statements(statementList),
    };
  },
});

jackSemantics.addAttribute<VarDec>("varDec", {
  VarDec(_a, type, name, rest, _b) {
    return {
      type: type.sourceString.trim() as Type,
      names: [
        name.sourceString,
        ...rest.children.map((n) => n.child(1).sourceString),
      ],
    };
  },
});

jackSemantics.addAttribute<Statement>("statement", {
  LetStatement(_a, name, index, _b, value, _c) {
    return {
      statementType: "letStatement",
      name: { value: name.sourceString, span: span(name.source) },
      arrayIndex: index?.child(0)?.child(1)?.expression,
      value: value.expression,
      span: span(this.source),
    };
  },

  IfStatement(_a, _b, condition, _c, _d, body, _e, elseBlock) {
    return {
      statementType: "ifStatement",
      condition: condition.expression,
      body: statements(body),
      else: elseBlock.child(0)?.else ?? [],
    };
  },

  WhileStatement(_a, _b, condition, _c, _d, body, _e) {
    return {
      statementType: "whileStatement",
      condition: condition.expression,
      body: statements(body),
    };
  },

  DoStatement(_a, call, _b) {
    return { statementType: "doStatement", call: call.term as SubroutineCall };
  },


  EmptyReturn(_a, _b) {
    return { statementType: "returnStatement" };
  },

  ReturnValue(_a, value, _b) {
    return {
      statementType: "returnStatement",
      value: value.expression,
    };
  },
});

jackSemantics.addAttribute<Statement[]>("else", {
  ElseBlock(_a, _b, body, _c) {
    return statements(body);
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

  ArrayAccess(name, index) {
    return {
      termType: "arrayAccess",
      name: { value: name.sourceString, span: span(name.source) },
      index: index.child(1).expression,
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

export const JACK = {
  parser: grammar,
  grammar: jackGrammar,
  semantics: jackSemantics,
  parse: makeParser<Class>(grammar, jackSemantics, (n) => n.class),
};
