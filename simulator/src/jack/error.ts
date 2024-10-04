import { ClassNameContext } from "./generated/JackParser";

export interface Span {
  start: number;
  end: number;
  line: number;
}
export class JackCompilerError {
  public span: Span;
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    public msg: string,
  ) {
    this.span = { start: startInd, end: endIndex, line: line };
  }
  public toString = (): string => {
    return (
      this.constructor.name +
      `(${this.span.line}:${this.span.start}:${this.span.end} ${this.msg})`
    );
  };
}

export class LexerOrParserError extends JackCompilerError {}
export class DuplicatedSubroutineError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    subroutineName: string,
  ) {
    super(line, startInd, endIndex, `Subroutine ${subroutineName} is already defined.`);
  }
}
export class DuplicatedClassError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    className: string,
  ) {
    super(line, startInd, endIndex, `Class ${ClassNameContext} is already defined.`);
  }
}


export class DuplicatedVariableException extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    variableName: string,
  ) {
    super(
      line,
      startInd,
      endIndex,
      "Duplicated local variable, field, argument or static variable " +
        variableName,
    );
  }
}

export class UndeclaredVariableError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    variableName: string,
  ) {
    super(line, startInd, endIndex, "Undeclared variable " + variableName);
  }
}
export class UnknownClassError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    className: string,
  ) {
    super(line, startInd, endIndex, `Class ${className} doesn't exist`);
  }
}

export class NonVoidFunctionNoReturnError extends JackCompilerError {
  constructor(line: number, startInd: number, endIndex: number) {
    super(
      line,
      startInd,
      endIndex,
      `A non void subroutine must return a value`,
    );
  }
}

export class VoidSubroutineReturnsValueError extends JackCompilerError {
  constructor(line: number, startInd: number, endIndex: number) {
    super(
      line,
      startInd,
      endIndex,
      `Cannot return a value from a void subroutine`,
    );
    Object.setPrototypeOf(this, VoidSubroutineReturnsValueError.prototype);
  }
}

export class SubroutineNotAllPathsReturnError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    subroutineName: string,
  ) {
    super(
      line,
      startInd,
      endIndex,
      `Subroutine ${subroutineName}: not all code paths return a value`,
    );
    Object.setPrototypeOf(this, SubroutineNotAllPathsReturnError.prototype);
  }
}

export class IncorrectParamsNumberInSubroutineCallError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    subroutineName: string,
    expectedParamsCount: number,
    actualParamsCount: number,
  ) {
    super(
      line,
      startInd,
      endIndex,
      `Subroutine ${subroutineName} (declared to accept ${expectedParamsCount} parameter(s)) called with  ${actualParamsCount} parameter(s)`,
    );
    Object.setPrototypeOf(
      this,
      IncorrectParamsNumberInSubroutineCallError.prototype,
    );
  }
}
export class UnknownSubroutineCallError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    subroutineName: string,
    className?: string,
  ) {
    super(
      line,
      startInd,
      endIndex,
      `Can't find subroutine '${subroutineName}'${className ? ` in ${className}` : ""}`,
    );
    Object.setPrototypeOf(this, UnknownSubroutineCallError.prototype);
  }
}
export class MethodCalledAsFunctionError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    subroutineId: string,
  ) {
    super(
      line,
      startInd,
      endIndex,
      `Method ${subroutineId} was called as a function/constructor`,
    );
    Object.setPrototypeOf(this, MethodCalledAsFunctionError.prototype);
  }
}
export class FunctionCalledAsMethodError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    subroutineId: string,
  ) {
    super(
      line,
      startInd,
      endIndex,
      `Function or constructor ${subroutineId} was called as a method`,
    );
    Object.setPrototypeOf(this, FunctionCalledAsMethodError.prototype);
  }
}

export class IncorrectConstructorReturnType extends JackCompilerError {
  constructor(line: number, startInd: number, endIndex: number) {
    super(
      line,
      startInd,
      endIndex,
      `The return type of a constructor must be of the class type`,
    );
    Object.setPrototypeOf(this, IncorrectConstructorReturnType.prototype);
  }
}

export class UnreachableCodeError extends JackCompilerError {
  constructor(line: number, startInd: number, endIndex: number) {
    super(line, startInd, endIndex, `Unreachable code`);
    Object.setPrototypeOf(this, UnreachableCodeError.prototype);
  }
}

export class ConstructorMushReturnThis extends JackCompilerError {
  constructor(line: number, startInd: number, endIndex: number) {
    super(line, startInd, endIndex, `A constructor must return 'this'`);
    Object.setPrototypeOf(this, ConstructorMushReturnThis.prototype);
  }
}

const vowels = "aeiou";
export class WrongLiteralTypeError extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    typeName: string,
  ) {
    const article = vowels.indexOf(typeName.substring(0, 1)) != -1 ? "an" : "a";
    super(line, startInd, endIndex, `${article} ${typeName} value is expected`);
    Object.setPrototypeOf(this, WrongLiteralTypeError.prototype);
  }
}

export class IntLiteralIsOutOfRange extends JackCompilerError {
  constructor(
    line: number,
    startInd: number,
    endIndex: number,
    value: number,
    min: number,
    max: number,
  ) {
    super(
      line,
      startInd,
      endIndex,
      `Integer constant(${value}) is out of range. Min value is ${min} and max value is ${max}`,
    );
    Object.setPrototypeOf(this, IntLiteralIsOutOfRange.prototype);
  }
}

export class FieldCantBeReferencedInFunction extends JackCompilerError {
  constructor(line: number, startInd: number, endIndex: number) {
    super(line, startInd, endIndex, `Field can't be referenced in a function`);
    Object.setPrototypeOf(this, FieldCantBeReferencedInFunction.prototype);
  }
}

export class ThisCantBeReferencedInFunction extends JackCompilerError {
  constructor(line: number, startInd: number, endIndex: number) {
    super(line, startInd, endIndex, `this can't be referenced in a function`);
    Object.setPrototypeOf(this, ThisCantBeReferencedInFunction.prototype);
  }
}
