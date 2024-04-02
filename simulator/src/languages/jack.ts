import ohm from "ohm-js";
import { baseSemantics, grammars, makeParser } from "./base.js";
import jackGrammar from "./grammars/jack.ohm.js";

type Type = "int" | "char" | "boolean" | string;

export interface Class {
  name: string;
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
  name: string;
  arrayIndex?: Expression;
  value: Expression;
}

export interface IfStatement {
  condition: Expression;
  body: Statement[];
  else: Statement[];
}

export interface WhileStatement {
  condition: Expression;
  body: Statement[];
}

export interface DoStatement {
  call: SubroutineCall;
}

export interface ReturnStatement {
  value?: Expression;
}

export type Op = "+" | "-" | "*" | "/" | "&" | "|" | "<" | ">" | "=";
export type KeywordCOnstant = "true" | "false" | "null" | "this";
export type UnaryOp = "-" | "~";

export interface StringLiteral {
  value: string;
}

export interface Variable {
  name: string;
}

export type Term =
  | number
  | StringLiteral
  | Variable
  | KeywordCOnstant
  | SubroutineCall
  | ArrayAccess
  | Expression
  | UnaryExpression;

export interface ExpressionPart {
  op: Op;
  term: Term;
}

export interface Expression {
  term: Term;
  rest: ExpressionPart[];
}

export interface UnaryExpression {
  op: UnaryOp;
  term: Term;
}

export interface ArrayAccess {
  name: string;
  index: Expression;
}

export interface CompoundIdentifier {
  suffix: string;
  prefix: string;
}

export type SubroutineName = string | CompoundIdentifier;
export interface SubroutineCall {
  name: SubroutineName;
  parameters: Expression[];
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
      name: name.sourceString,
      varDecs: varDecs.children.map((n) => n.classVarDec),
      subroutines: subroutines.children.map((n) => n.subroutineDec),
    };
  },
});

jackSemantics.addAttribute<ClassVarDec>("classVarDec", {
  ClassVarDec(varType, type, name, rest, _) {
    return {
      varType: varType.sourceString as ClassVarType,
      type: type.sourceString as Type,
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
      type: type.sourceString as SubroutineType,
      returnType: returnType.sourceString as ReturnType,
      name: name.sourceString,
      parameters: parameters.parameters,
      body: body.subroutineBody,
    };
  },
});

jackSemantics.addAttribute<Parameter>("parameter", {
  Parameter(type, name) {
    return {
      type: type.sourceString as Type,
      name: name.sourceString,
    };
  },
});

jackSemantics.addAttribute<Parameter[]>("parameters", {
  ParameterList(node) {
    if (node.children.length > 0) {
      const [first, rest] = node.children;
      return [
        first.parameter,
        ...rest.children.map((n) => {
          n.child(1).parameter;
        }),
      ];
    } else {
      return [];
    }
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
      type: type.sourceString as Type,
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
      name: name.sourceString,
      index: index?.child(1)?.expression,
      value: value.expression,
    };
  },

  IfStatement(_a, _b, condition, _c, _d, body, _e, elseBlock) {
    return {
      condition: condition.expression,
      body: statements(body),
      else: elseBlock?.else,
    };
  },

  WhileStatement(_a, _b, condition, _c, _d, body, _e) {
    return {
      condition: condition.expression,
      body: statements(body),
    };
  },

  DoStatement(_a, call, _b) {
    return { call: call.term as SubroutineCall };
  },

  ReturnStatement(_a, value, _b) {
    return {
      value: value.children.length > 0 ? value.child(0).expression : undefined,
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
    return Number(node.sourceString);
  },

  stringConstant(_a, _b, _c) {
    return { value: this.sourceString.slice(1, -1) };
  },

  keywordConstant(_) {
    return this.sourceString as KeywordCOnstant;
  },

  SubroutineCall(name, _a, expressions, _b) {
    return {
      name: name.subroutineName,
      parameters: expressions.expressionList,
    };
  },

  ArrayAccess(name, index) {
    return {
      name: name.sourceString,
      index: index.child(1).expression,
    };
  },

  jackIdentifier(first, rest) {
    return { name: `${first.sourceString}${rest.sourceString}` };
  },

  GroupedExpression(_a, expression, _b) {
    return expression.expression;
  },

  UnaryExpression(op, term) {
    return { op: op.sourceString as UnaryOp, term: term.term };
  },
});

jackSemantics.addAttribute<SubroutineName>("subroutineName", {
  SubroutineName(_) {
    const parts: string[] = this.sourceString.split(".");
    return this.sourceString.includes(".")
      ? {
          prefix: parts[0],
          suffix: parts[1],
        }
      : this.sourceString;
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
      term: first.term,
      rest: rest.children.map((n) => n.expressionPart),
    };
  },
});

jackSemantics.addAttribute<ExpressionPart>("expressionPart", {
  ExpressionPart(op, term) {
    return { op: op.sourceString as Op, term: term.term };
  },
});

export const JACK = {
  parser: grammar,
  grammar: jackGrammar,
  semantics: jackSemantics,
  parse: makeParser<Class>(grammar, jackSemantics, (n) => n.class),
};
