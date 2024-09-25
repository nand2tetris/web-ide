import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';
export class ErrorListener implements ANTLRErrorListener<any> {
    static instance: ErrorListener;
    public filepath: string = "";
    public error: boolean = false;
    static getInstance(): ErrorListener {
        if (this.instance == null) {
            this.instance = new ErrorListener()
        }
        return this.instance;
    }


    // constructor(private filepath: string, ) { };
    /**
     * Provides a default instance of {@link ConsoleErrorListener}.
    */
    syntaxError<T extends any>(recognizer: Recognizer<T, any>, offendingSymbol: T | undefined, line: number, charPositionInLine: number, msg: string, e: RecognitionException | undefined) {
        this.error = true;
        console.error(`${this.filepath}:${line}:${charPositionInLine} \n${msg}`);
    };
}