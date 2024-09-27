export class JackCompilerError {
    /**
     * 
     * @param line - line number
     * @param charPositionInLine  - charPositionInLine in the line
     * @param msg  - error message
     */
    constructor(public line: number, public charPositionInLine: number, public msg: string) {
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
        super(line, charPositionInLine, `Class ${className} doesn't exist` );
    }

}

export class NonVoidFunctionNoReturnError extends JackCompilerError {

    //TODO: should we add a subroutine name?
    constructor(line: number, charPositionInLine: number) {
        super(line, charPositionInLine, `A non void subroutine must return a value` );
    }

}

export class VoidSubroutineReturnsValueError extends JackCompilerError {

    constructor(line: number, charPositionInLine: number) {
        super(line, charPositionInLine, `Cannot return a value from a void subroutine` );
        Object.setPrototypeOf(this, VoidSubroutineReturnsValueError.prototype);
    }

}

export class SubroutineNotAllPathsReturn extends JackCompilerError {

    constructor(line: number, charPositionInLine: number, subroutineName: string) {
        super(line, charPositionInLine, `Subroutine ${subroutineName}: not all code paths return a value` );
        Object.setPrototypeOf(this, SubroutineNotAllPathsReturn.prototype);
    }

}