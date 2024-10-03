import { ErrorListener, RecognitionException, Recognizer, Token } from "antlr4";
import { JackCompilerError, LexerOrParserError } from "../error.js";
export class CustomErrorListener extends ErrorListener<any> {
  public errors: JackCompilerError[] = [];

  override syntaxError = (
    recognizer: Recognizer<any>,
    offendingSymbol: any,
    line: number,
    column: number,
    msg: string,
    e: RecognitionException | undefined,
  ) => {
    const t = offendingSymbol as Token;
    this.errors.push(new LexerOrParserError(line, t.start, t.stop + 1, msg));
  };
}
