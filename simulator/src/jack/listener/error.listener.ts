import {
  ErrorListener,
  NoViableAltException,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4";
import { JackCompilerError, LexerOrParserError } from "../error.js";
import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
interface LexerNoViableAltException {
  startIndex: number;
}
export class JackCustomErrorListener extends ErrorListener<any> {
  public errors: JackCompilerError[] = [];

  override syntaxError = (
    recognizer: Recognizer<any>,
    offendingSymbol: any,
    line: number,
    column: number,
    msg: string,
    e: RecognitionException | undefined,
  ) => {
    if (offendingSymbol != null || (e != null && e.offendingToken != null)) {
      const t = offendingSymbol ?? (assertExists(e).offendingToken as Token);
      this.errors.push(new LexerOrParserError(line, t.start, t.stop + 1, msg));
    } else if (e instanceof NoViableAltException) {
      this.errors.push(
        new LexerOrParserError(
          line,
          e.startToken.start,
          e.startToken.stop + 1,
          msg,
        ),
      );
    }
    //antlr doesn't provide a class for LexerNoViableAltException atm. Once https://github.com/antlr/antlr4/pull/4711 is release we can change it
    else if (e != null && "startIndex" in e) {
      const err = e as LexerNoViableAltException;
      this.errors.push(
        new LexerOrParserError(line, err.startIndex, err.startIndex + 1, msg),
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error");
    }
  };
}
