import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';
import { JackCompilerError, LexerOrParserError } from '../error';
export class ErrorListener implements ANTLRErrorListener<any> {
    static instance: ErrorListener;
    public filepath: string = "";
    public errors: JackCompilerError[] = [];

    /**
     * Provides a default instance of {@link ConsoleErrorListener}.
    */
    syntaxError<T extends any>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined) {
        this.errors.push(new LexerOrParserError(this.filepath, line, charPositionInLine, msg));
        console.error(`${this.filepath}:${line}:${charPositionInLine} \n${msg}`);
    };
}