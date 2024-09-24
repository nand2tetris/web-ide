export class JackCompilerError extends Error {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, JackCompilerError.prototype);
    }
}
export class DuplicatedSubroutineError extends JackCompilerError {
    constructor(msg: string) {
        super(msg);

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, DuplicatedSubroutineError.prototype);
    }

}