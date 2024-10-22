import {
  ANTLRErrorListener,
  ATNConfigSet,
  ATNSimulator,
  BitSet,
  DFA,
  LexerNoViableAltException,
  NoViableAltException,
  Parser,
  RecognitionException,
  Recognizer,
  Token,
} from "antlr4ng";
import { JackCompilerError, LexerOrParserError } from "../error.js";
import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";

export class CustomErrorListener implements ANTLRErrorListener {
  public errors: JackCompilerError[] = [];
  syntaxError<S extends Token, T extends ATNSimulator>(
    _recognizer: Recognizer<T>,
    offendingSymbol: S | null,
    line: number,
    _charPositionInLine: number,
    msg: string,
    e: RecognitionException | null,
  ): void {
    if (offendingSymbol != null || (e != null && e.offendingToken != null)) {
      const t = offendingSymbol ?? (e?.offendingToken as Token);
      this.errors.push(
        LexerOrParserError(
          { line: line, start: t.start, end: t.stop + 1 },
          msg,
        ),
      );
    } else if (e instanceof NoViableAltException) {
      //theoretically we can't get this exception
      const token = assertExists(
        e.startToken ?? e.offendingToken,
        "Cant find start token for NoViableAltException",
      );
      this.errors.push(
        LexerOrParserError(
          { line: token.line, start: token.start, end: token.stop },
          msg,
        ),
      );
    } else if (e instanceof LexerNoViableAltException) {
      this.errors.push(
        LexerOrParserError(
          { line: line, start: e.startIndex, end: e.startIndex + 1 },
          msg,
        ),
      );
    } else {
      console.error("Don't know how to handle this error");
      throw new Error("Don't know how to handle this error ");
    }
  }

  reportAmbiguity(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _exact: boolean,
    _ambigAlts: BitSet | undefined,
    _configs: ATNConfigSet,
  ): void {
    return;
  }
  reportAttemptingFullContext(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _conflictingAlts: BitSet | undefined,
    _configs: ATNConfigSet,
  ): void {
    return;
  }
  reportContextSensitivity(
    _recognizer: Parser,
    _dfa: DFA,
    _startIndex: number,
    _stopIndex: number,
    _prediction: number,
    _configs: ATNConfigSet,
  ): void {
    return;
  }
}
