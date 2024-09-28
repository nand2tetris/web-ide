export class JackCompilerError {
    /**
     * 
     * @param line - line number
     * @param charPositionInLine  - charPositionInLine in the line
     * @param msg  - error message
     */
    constructor(public line: number, public charPositionInLine: number, public msg: string) {
    }
    public toString = (): string => {
        return this.constructor.name + `(${this.line}:${this.charPositionInLine} ${this.msg})`;
    }
}

export class LexerOrParserError extends Error {
    /**
     * 
     * @param line - line number
     * @param charPositionInLine  - charPositionInLine in the line
     * @param msg  - error message
     */
    constructor(public filepath: string, public line: number, public charPositionInLine: number, public msg: string) {
        super(msg);
    }
}
export class DuplicatedSubroutineError extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, msg: string) {
        super(line, charPositionInLine, msg);
    }
}

export class DuplicatedVariableException extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, variableName: string) {
        super(line, charPositionInLine, "Duplicated variable " + variableName);
    }

}


export class UndeclaredVariableError extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, variableName: string) {
        super(line, charPositionInLine, "Undeclared variable " + variableName);
    }

}


export class UnknownClassError extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, className: string) {
        super(line, charPositionInLine, `Class ${className} doesn't exist`);
    }

}

export class NonVoidFunctionNoReturnError extends JackCompilerError {

    //TODO: should we add a subroutine name?
    constructor(line: number, charPositionInLine: number) {
        super(line, charPositionInLine, `A non void subroutine must return a value`);
    }

}

export class VoidSubroutineReturnsValueError extends JackCompilerError {

    constructor(line: number, charPositionInLine: number) {
        super(line, charPositionInLine, `Cannot return a value from a void subroutine`);
        Object.setPrototypeOf(this, VoidSubroutineReturnsValueError.prototype);
    }

}

export class SubroutineNotAllPathsReturnError extends JackCompilerError {

    constructor(line: number, charPositionInLine: number, subroutineName: string) {
        super(line, charPositionInLine, `Subroutine ${subroutineName}: not all code paths return a value`);
        Object.setPrototypeOf(this, SubroutineNotAllPathsReturnError.prototype);
    }

}

export class IncorrectParamsNumberInSubroutineCallError extends JackCompilerError {

    constructor(line: number,
        charPositionInLine: number,
        subroutineName: string,
        expectedParamsCount: number,
        actualParamsCount: number) {
        super(line, charPositionInLine,
            `Subroutine ${subroutineName} expects ${expectedParamsCount} arguments while ${actualParamsCount} was provided`);
        Object.setPrototypeOf(this, IncorrectParamsNumberInSubroutineCallError.prototype);
    }

}
export class UnknownSubroutineCallError extends JackCompilerError {
    constructor(line: number,
        charPositionInLine: number,
        subroutineName: string,
        className?: string) {
        super(line, charPositionInLine, `Can't find subroutine '${subroutineName}' ${className ? `in ${className}` : ""} `);
        Object.setPrototypeOf(this, UnknownSubroutineCallError.prototype);
    }
}
export class MethodCalledAsFunctionError extends JackCompilerError {
    constructor(line: number,
        charPositionInLine: number,
        subroutineId: string) {
        super(line, charPositionInLine, `Method ${subroutineId} was called as a function/constructor`);
        Object.setPrototypeOf(this, MethodCalledAsFunctionError.prototype);
    }
}
export class FunctionCalledAsMethodError extends JackCompilerError {
    constructor(line: number,
        charPositionInLine: number,
        subroutineId: string) {
        super(line, charPositionInLine, `Function or constructor ${subroutineId} was called as a method`);
        Object.setPrototypeOf(this, FunctionCalledAsMethodError.prototype);
    }
}