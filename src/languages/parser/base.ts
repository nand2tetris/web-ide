// https://docs.rs/nom/latest/nom/index.html

/** Base utilities for a common parser combinator toolkit. */
import { assert } from "@davidsouther/jiffies/lib/esm/assert";
import { Err, Result } from "@davidsouther/jiffies/lib/esm/result";

interface ErrorContext {
  message?: string;
  span?: StringLike;
  cause?: ParseError | StringLike;
}
export class ParseError {
  readonly name: string = "ParseError";
  constructor(readonly context?: ErrorContext) {}

  toString(indent = "") {
    const { message, span, cause } = this.context ?? {};
    let str = indent + this.name;
    if (message) {
      str = `${str} (${message})`;
    }
    if (span instanceof Span) {
      str = `${str} [${span.pos}; ${span.line},${span.col}]`;
    }
    if (span) {
      if (span.length > 15) {
        str = `${str} at ${span.substring(0, 15)}...`;
      } else {
        str = `${str} at '${span}'`;
      }
    }
    if (cause) {
      if (cause instanceof ParseError) {
        str = `${str}\n${indent}Cause:\n${cause.toString(indent + "  ")}`;
      } else {
        str = `${str}\n${indent}Cause:\n${indent}  ${cause}`;
      }
    }
    return str;
  }
}

export interface StringLike {
  length: number;
  // [i: number]: string;
  toString(): string;
  indexOf(input: StringLike): number;
  charAt(n: number): string;
  substring(start: number, end?: number): StringLike;
}

export type IResult<O> = Result<[StringLike, O], ParseError>;

export interface Parser<O = StringLike> {
  (input: StringLike): IResult<O>;
}

export class Span implements StringLike {
  readonly pos: number = 0;
  readonly line: number = 1;
  readonly col: number = 1;

  get length(): number {
    return this.end - this.start;
  }

  constructor(
    private readonly str: StringLike,
    private readonly start: number = 0,
    readonly end: number = str.length - start
  ) {
    assert(
      end <= str.length,
      "Creating Span longer than underlying StringLike"
    );

    if (str instanceof Span) {
      this.pos = str.pos + start;
      this.line = str.line;
      this.col = str.col;
    } else {
      this.pos = start;
    }

    for (let i = 0; i < this.start; i++) {
      this.col += 1;
      if (this.str.charAt(i) === "\n") {
        this.line += 1;
        this.col = 1;
      }
    }
  }

  charAt(n: number): string {
    return this.str.charAt(this.start + n);
  }

  indexOf(input: StringLike): number {
    return this.toString().indexOf(input.toString());
  }

  toString(): string {
    return this.str.toString().substring(this.start, this.end);
  }

  substring(start: number, end: number = this.length): StringLike {
    assert(start >= 0, "Cannot use negative substring");
    assert(end >= start);
    return new Span(this, start, end);
  }
}

export type ParseErrorType = ParseErrorError | ParseIncomplete | ParseFailure;

export class ParseErrorError extends ParseError {
  override readonly name = "Parse Error";
}

/** Error indicating how much input is necessary */
export class ParseIncomplete extends ParseError {
  override readonly name = "Parse Incomplete";

  constructor(readonly needed: number, context?: ErrorContext) {
    super(context);
  }
}

/** Unrecoverable error */
export class ParseFailure extends ParseError {
  override readonly name = "Parse Failure";
}

export const ParseErrors = {
  error(message: string, context?: ErrorContext) {
    return Err(new ParseError({ message, ...context }));
  },
  failure(message: string, context?: ErrorContext) {
    return Err(new ParseFailure({ message, ...context }));
  },
  incomplete(n: number, context?: ErrorContext) {
    return Err(new ParseIncomplete(n, context));
  },
};
