import { type Node, grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  grammars,
  isFail,
  makeParsers,
  type ParseError,
  parseErrorOf,
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
 * `E` widens the lists at the recovery points; `never` is the strict type that
 * a valid parse produces, `ParseError` the partial one.
 */
export interface Class<E = never> {
  name: { value: string; span: Span };
  varDecs: (ClassVarDec | E)[];
  subroutines: (Subroutine<E> | E)[];
}

/** A Class where recovery may have replaced items with error nodes. */
export type ClassPartial = Class<ParseError>;

export type ClassVarType = "static" | "field";

export interface ClassVarDec {
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

export interface Subroutine<E = never> {
  type: SubroutineType;
  name: { value: string; span: Span };
  returnType: { value: ReturnType; span: Span };
  parameters: Parameter[];
  body: SubroutineBody<E>;
}

export interface SubroutineBody<E = never> {
  varDecs: (VarDec | E)[];
  statements: (Statement<E> | E)[];
}

export interface VarDec {
  type: { value: Type; span: Span };
  names: string[];
}

export type Statement<E = never> =
  | LetStatement
  | IfStatement<E>
  | WhileStatement<E>
  | DoStatement
  | ReturnStatement;

export interface LetStatement {
  statementType: "letStatement";
  name: { value: string; span: Span };
  arrayIndex?: Expression;
  value: Expression;
  span: Span;
}

export interface IfStatement<E = never> {
  statementType: "ifStatement";
  condition: Expression;
  body: (Statement<E> | E)[];
  else: (Statement<E> | E)[];
}

export interface WhileStatement<E = never> {
  statementType: "whileStatement";
  condition: Expression;
  body: (Statement<E> | E)[];
}

export interface DoStatement {
  statementType: "doStatement";
  call: SubroutineCall;
}

export interface ReturnStatement {
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

type PartialStatement = Statement<ParseError> | ParseError;

/**
 * A block's statements: the kept statements, then the synchronizer slot's
 * error node when the block recovered.
 */
function block(list: Node, end: Node): PartialStatement[] {
  const kept: PartialStatement[] = isFail(list)
    ? []
    : list.children.map((n) => n.statement);
  return isFail(end) ? [...kept, parseErrorOf(end)] : kept;
}

jackSemantics.addAttribute<ClassPartial>("Root", {
  Root(_) {
    return this.class;
  },
});

jackSemantics.addAttribute<ClassPartial>("class", {
  Class(_a, name, _b, varDecs, subroutines, close) {
    const kept = subroutines.children.map((n) => n.subroutineDec);
    // Skipped text after the subroutines becomes an error node; a class that
    // only lacks its `}` keeps its subroutines as they are.
    const skipped = isFail(close) && close.sourceString.length > 0;
    return {
      name: { value: name.sourceString, span: span(name.source) },
      varDecs: varDecs.children.map((n) => n.classVarDec),
      subroutines: skipped ? [...kept, parseErrorOf(close)] : kept,
    };
  },
});

jackSemantics.addAttribute<ClassVarDec | ParseError>("classVarDec", {
  ClassVarDec(body, end) {
    return isFail(end) ? parseErrorOf(end) : body.classVarDec;
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

jackSemantics.addAttribute<Subroutine<ParseError> | ParseError>(
  "subroutineDec",
  {
    SubroutineDec(head, open, body) {
      if (isFail(open)) {
        return parseErrorOf(open);
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
  },
);

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

jackSemantics.addAttribute<SubroutineBody<ParseError>>("subroutineBody", {
  SubroutineBody(_a, varDecs, statementList, end) {
    return {
      varDecs: varDecs.children.map((n) => n.varDec),
      statements: block(statementList, end),
    };
  },
});

jackSemantics.addAttribute<VarDec | ParseError>("varDec", {
  VarDec(body, end) {
    return isFail(end) ? parseErrorOf(end) : body.varDec;
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

jackSemantics.addAttribute<PartialStatement>("statement", {
  LetStatement(body, end) {
    return isFail(end)
      ? parseErrorOf(end)
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
    if (isFail(open)) {
      return parseErrorOf(open);
    }
    return {
      statementType: "ifStatement",
      condition: head.child(2).expression,
      body: block(body, end),
      else: elseBlock.child(0)?.else ?? [],
    };
  },

  WhileStatement(head, open, body, end) {
    if (isFail(open)) {
      return parseErrorOf(open);
    }
    return {
      statementType: "whileStatement",
      condition: head.child(2).expression,
      body: block(body, end),
    };
  },

  DoStatement(body, end) {
    return isFail(end) ? parseErrorOf(end) : body.statement;
  },

  DoBody(_a, call) {
    return { statementType: "doStatement", call: call.term as SubroutineCall };
  },

  ReturnStatement(body, end) {
    return isFail(end)
      ? parseErrorOf(end)
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

jackSemantics.addAttribute<PartialStatement[]>("else", {
  ElseBlock(_a, _b, body, end) {
    return block(body, end);
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

export const JACK = {
  parser: grammar,
  grammar: jackGrammar,
  semantics: jackSemantics,
  ...makeParsers<ClassPartial>(grammar, jackSemantics, (n) => n.class),
};
