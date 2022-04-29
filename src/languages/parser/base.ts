// https://docs.rs/nom/latest/nom/index.html

/** Base utilities for a common parser combinator toolkit. */
import { Err, Result } from "@davidsouther/jiffies/result.js";

export class ParseError extends Error {
  constructor(message: string, readonly cause?: ParseError | string) {
    super(message);
  }
}

export type IResult<O> = Result<[string, O], ParseError>;

export interface Parser<O = string> {
  (input: string): IResult<O>;
}

export type ParseErrorType = ParseErrorError | ParseIncomplete | ParseFailure;

export class ParseErrorError extends ParseError {
  readonly name = "Parse Error";
}

/** Error indicating how much input is necessary */
export class ParseIncomplete extends ParseError {
  readonly name = "Parse Incomplete";

  constructor(readonly needed: number) {
    super("Parse Incomplete");
  }
}

/** Unrecoverable error */
export class ParseFailure extends ParseError {
  readonly name = "Parse Failure";
}

export const ParseErrors = {
  error(message: string, cause?: ParseError | string) {
    return Err(new ParseError(message, cause));
  },
  failure(message: string, cause?: ParseError | string) {
    return Err(new ParseFailure(message, cause));
  },
  incomplete(n: number) {
    return Err(new ParseIncomplete(n));
  },
};
