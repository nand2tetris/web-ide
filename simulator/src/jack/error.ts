import { ParserRuleContext, TerminalNode } from "antlr4ng";
import { assertExists } from "./listener/common.js";

export interface Span {
  start: number;
  end: number;
  line: number;
}
export const terminalNodeToSpan = (node: TerminalNode): Span => {
  const s = node.getSymbol();
  return {
    line: s.line,
    start: s.start,
    end: s.stop + 1,
  };
};

export const ruleContextToSpan = (ctx: ParserRuleContext): Span => {
  const start = assertExists(
    ctx.start,
    " Cannot find start token when creating an error"
  );
  return {
    line: start.line,
    start: start.start,
    end: ctx.stop ? ctx.stop.stop + 1 : start.stop,
  };
};

export type JackCompilerErrorType =
  | "ConstructorMushReturnThisError"
  | "DuplicatedClassError"
  | "DuplicatedSubroutineError"
  | "DuplicatedVariableError"
  | "FieldCantBeReferencedInFunctionError"
  | "FilenameDoesntMatchClassNameError"
  | "FunctionCalledAsMethodError"
  | "IncorrectConstructorReturnTypeError"
  | "IncorrectParamsNumberInSubroutineCallError"
  | "IntLiteralIsOutOfRangeError"
  | "LexerOrParserError"
  | "MethodCalledAsFunctionError"
  | "NonVoidFunctionNoReturnError"
  | "SubroutineNotAllPathsReturnError"
  | "ThisCantBeReferencedInFunctionError"
  | "UndeclaredVariableError"
  | "UnknownClassError"
  | "UnknownSubroutineCallError"
  | "UnreachableCodeError"
  | "VoidSubroutineReturnsValueError"
  | "WrongLiteralTypeError";

export interface JackCompilerError {
  type: JackCompilerErrorType;
  span: Span;
  msg: string;
}

export function makeJackCompilerError(
  type: JackCompilerErrorType,
  span: Span,
  msg: string
): JackCompilerError {
  return {
    type,
    span,
    msg,
  };
}

export const ConstructorMushReturnThisError = (span: Span) =>
  makeJackCompilerError(
    "ConstructorMushReturnThisError",
    span,
    `A constructor must return 'this'`
  );

export const DuplicatedClassError = (span: Span, className: string) =>
  makeJackCompilerError(
    "DuplicatedClassError",
    span,
    `Class ${className} is already defined.`
  );

export const DuplicatedSubroutineError = (span: Span, subroutineName: string) =>
  makeJackCompilerError(
    "DuplicatedSubroutineError",
    span,
    `Subroutine ${subroutineName} is already defined.`
  );

export const DuplicatedVariableError = (span: Span, variableName: string) =>
  makeJackCompilerError(
    "DuplicatedVariableError",
    span,
    `Duplicated local variable, field, argument or static variable ${variableName}`
  );

export const FieldCantBeReferencedInFunctionError = (span: Span) =>
  makeJackCompilerError(
    "FieldCantBeReferencedInFunctionError",
    span,
    `Field can't be referenced in a function`
  );

export const FilenameDoesntMatchClassNameError = (
  span: Span,
  filename: string,
  className: string
) =>
  makeJackCompilerError(
    "FilenameDoesntMatchClassNameError",
    span,
    `Class name ${className} doesn't match file name ${filename}`
  );

export const FunctionCalledAsMethodError = (span: Span, subroutineId: string) =>
  makeJackCompilerError(
    "FunctionCalledAsMethodError",
    span,
    `Function or constructor ${subroutineId} was called as a method`
  );

export const IncorrectConstructorReturnTypeError = (span: Span) =>
  makeJackCompilerError(
    "IncorrectConstructorReturnTypeError",
    span,
    `The return type of a constructor must be of the class type`
  );

export const IncorrectParamsNumberInSubroutineCallError = (
  span: Span,
  subroutineName: string,
  expectedParamsCount: number,
  actualParamsCount: number
) =>
  makeJackCompilerError(
    "IncorrectParamsNumberInSubroutineCallError",
    span,
    `Expected ${expectedParamsCount} arguments, but got ${actualParamsCount}`);

export const IntLiteralIsOutOfRangeError = (
  span: Span,
  value: number,
  min: number,
  max: number
) =>
  makeJackCompilerError(
    "IntLiteralIsOutOfRangeError",
    span,
    `Integer constant(${value}) is out of range. Min value is ${min} and max value is ${max}`
  );

export const LexerOrParserError = (span: Span, msg: string) =>
  makeJackCompilerError("LexerOrParserError", span, msg);

export const MethodCalledAsFunctionError = (span: Span, subroutineId: string) =>
  makeJackCompilerError(
    "MethodCalledAsFunctionError",
    span,
    `Method ${subroutineId} was called as a function/constructor`
  );

export const NonVoidFunctionNoReturnError = (span: Span) =>
  makeJackCompilerError(
    "NonVoidFunctionNoReturnError",
    span,
    `A non void subroutine must return a value`
  );

export const SubroutineNotAllPathsReturnError = (
  span: Span,
  subroutineName: string
) =>
  makeJackCompilerError(
    "SubroutineNotAllPathsReturnError",
    span,
    `Subroutine ${subroutineName}: not all code paths return a value`
  );

export const ThisCantBeReferencedInFunctionError = (span: Span) =>
  makeJackCompilerError(
    "ThisCantBeReferencedInFunctionError",
    span,
    `this can't be referenced in a function`
  );

export const UndeclaredVariableError = (span: Span, variableName: string) =>
  makeJackCompilerError(
    "UndeclaredVariableError",
    span,
    `Undeclared variable ${variableName}`
  );

export const UnknownClassError = (span: Span, className: string) =>
  makeJackCompilerError(
    "UnknownClassError",
    span,
    `Class ${className} doesn't exist`
  );

export const UnknownSubroutineCallError = (
  span: Span,
  subroutineName: string,
  className?: string
) =>
  makeJackCompilerError(
    "UnknownSubroutineCallError",
    span,
    `Can't find subroutine '${subroutineName} in '${className ?? "(unknown)"}`
  );

export const UnreachableCodeError = (span: Span) =>
  makeJackCompilerError("UnreachableCodeError", span, `Unreachable code`);

export const VoidSubroutineReturnsValueError = (span: Span) =>
  makeJackCompilerError(
    "VoidSubroutineReturnsValueError",
    span,
    "Cannot return a value from a void subroutine"
  );

export const WrongLiteralTypeError = (span: Span, expectedTypeName: string, actualTypeName:string) =>
  makeJackCompilerError(
    "WrongLiteralTypeError",
    span,
    `Cannot assign ${actualTypeName} type to ${expectedTypeName}`
  );
