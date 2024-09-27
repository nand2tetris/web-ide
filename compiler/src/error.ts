export class JackCompilerError extends Error {
    /**
     * 
     * @param line - line number
     * @param charPositionInLine  - charPositionInLine in the line
     * @param msg  - error message
     */
    constructor(public line: number, public charPositionInLine: number, public msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JackCompilerError.prototype);
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

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, LexerOrParserError.prototype);
    }
}
export class DuplicatedSubroutineError extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, msg: string) {
        super(line, charPositionInLine, msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DuplicatedSubroutineError.prototype);
    }

}

export class DuplicatedVariableException extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, variableName: string) {
        super(line, charPositionInLine, "Duplicated variable " + variableName);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DuplicatedVariableException.prototype);
    }

}


export class UndeclaredVariableError extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, variableName: string) {
        super(line, charPositionInLine, "Undeclared variable " + variableName);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UndeclaredVariableError.prototype);
    }

}


export class UnknownTypeError extends JackCompilerError {
    constructor(line: number, charPositionInLine: number, type: string) {
        super(line, charPositionInLine, "Unknown type " + type);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnknownTypeError.prototype);
    }

}
