import {
  ErrorListener,
  NoViableAltException,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4";
import { asSpan, JackCompilerError, LexerOrParserError } from "../error.js";
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
    err: RecognitionException | undefined
  ) => {
    if (offendingSymbol != null || err?.offendingToken) {
      const t = offendingSymbol ?? (assertExists(err).offendingToken as Token);
      this.errors.push(
        LexerOrParserError({ line, start: t.start, end: t.stop + 1 }, msg)
      );
    } else if (err instanceof NoViableAltException) {
      //TODO: RL change and fix
      this.errors.push(LexerOrParserError(asSpan(err.startToken), msg));
    }
    //antlr doesn't provide a class for LexerNoViableAltException atm. Once https://github.com/antlr/antlr4/pull/4711 is release we can change it
    else if (err != null && "startIndex" in err) {
      const startIndex = err.startIndex as number;
      this.errors.push(
        LexerOrParserError(
          {
            line,
            start: startIndex,
            end: startIndex + 1,
          },
          msg
        )
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error");
    }
  };
}
