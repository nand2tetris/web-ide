import {
  ErrorListener,
  NoViableAltException,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4";
import { JackCompilerError, LexerOrParserError } from "../error.js";
interface LexerNoViableAltException {
  startIndex: number;
}
export class CustomErrorListener extends ErrorListener<any> {
  public errors: JackCompilerError[] = [];

  override syntaxError = (
    recognizer: Recognizer<any>,
    offendingSymbol: any,
    line: number,
    column: number,
    msg: string,
    err: RecognitionException | undefined,
  ) => {
    if (offendingSymbol != null || (err?.offendingToken)) {
      const t = offendingSymbol ?? (err!.offendingToken as Token);
      this.errors.push(LexerOrParserError({line, start: t.start, end: t.stop + 1}));
    } else if (err instanceof NoViableAltException) {
      this.errors.push(
        LexerOrParserError({line, start: err.startIndex, end: err.startIndex + 1})
      );
    }
    //antlr doesn't provide a class for LexerNoViableAltException atm. Once https://github.com/antlr/antlr4/pull/4711 is release we can change it
    else if (err != null && "startIndex" in err) {
      this.errors.push(
        LexerOrParserError({line, start: err.startIndex, end: err.startIndex + 1}, msg),
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error");
    }
  };
}
