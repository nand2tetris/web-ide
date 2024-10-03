import { ErrorListener, RecognitionException, Recognizer, Token } from "antlr4";
import { JackCompilerError, LexerOrParserError } from "../error.js";
export class CustomErrorListener extends ErrorListener<any> {
  public errors: JackCompilerError[] = [];

  /**
   * Provides a default instance of {@link ConsoleErrorListener}.
   */
  override syntaxError = (
    recognizer: Recognizer<any>,
    offendingSymbol: any,
    line: number,
    column: number,
    msg: string,
    e: RecognitionException | undefined,
  ) => {
    const t = offendingSymbol as Token;
    const endIndex = column + t.text.length;
    this.errors.push(new LexerOrParserError(line, column, endIndex, msg));
  };

}

/**
 * 
  We can add next methods (should be properties) to the error listener class to speed up parsing process. This is not part of Error listener ts class but exists in js implementation
  reportAmbiguity(recognizer: any, dfa: any, startIndex: any, stopIndex: any, exact: any, ambigAlts: any, configs: any) {
      console.log(`Ambiguity detected at ${this.filepath}:${startIndex}:${stopIndex}`);
  }

  reportContextSensitivity(recognizer: any, dfa: any, startIndex: any, stopIndex: any, prediction: any, configs: any) {
      console.log(`Context sensitivity detected at ${this.filepath}:${startIndex}:${stopIndex}`);
  }
 */