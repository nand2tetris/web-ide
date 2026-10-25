import { Err, isErr, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Dict,
  type Grammar,
  grammar,
  Interval,
  type MatchResult,
  type Semantics,
} from "ohm-js";
import { int2, int10, int16 } from "../util/twos.js";

import baseGrammar from "./grammars/base.ohm.js";
export const grammars = {
  Base: grammar(baseGrammar),
};

export const baseSemantics = grammars.Base.createSemantics();

baseSemantics.extendOperation("asIteration", {
  List(list, _) {
    return list.asIteration();
  },
});

baseSemantics.addAttribute("value", {
  decNumber(_, digits): number {
    return int10(digits.sourceString);
  },
  wholeDec(_, digits): number {
    return int10(digits.sourceString);
  },
  binNumber(_, digits) {
    return int2(digits.sourceString);
  },
  hexNumber(_, digits) {
    return int16(digits.sourceString);
  },
  Number(num) {
    return num.value;
  },
  Name(ident) {
    return ident.name;
  },
  identifier(_, __): string {
    return this.sourceString;
  },
  _iter(...children) {
    return children.map((c) => c.value);
  },
  _terminal() {
    return this.sourceString;
  },
});

baseSemantics.addAttribute("name", {
  identifier(_, __): string {
    return this.sourceString;
  },
  Name(_): string {
    return this.child(0)?.name;
  },
});

baseSemantics.addAttribute("String", {
  String(_a, str, _b) {
    return str.sourceString;
  },
});

export interface CompilationError {
  message: string;
  span?: Span;
  /** Every error found by a recovering parse, with this error first. */
  readonly errors?: CompilationError[];
}

/** An error node that stands in the AST where recovery skipped input. */
export interface ParseError {
  readonly kind: "ParseError";
  readonly error: CompilationError;
  readonly span: Span;
}

/** A partial parse: `errors` is empty when the source is valid. */
export interface Parsed<A> {
  readonly ast: A;
  readonly errors: CompilationError[];
}

/**
 * When recovery cannot finish, this is `Err(error)`, where `error` is today's
 * first error and `error.errors` lists every error found, itself first.
 */
export type ParseResult<A> = Result<Parsed<A>, CompilationError>;

export function isParseError(node: unknown): node is ParseError {
  return (
    typeof node === "object" &&
    node !== null &&
    (node as { kind?: unknown }).kind === "ParseError"
  );
}

/** Turns a partial AST into the strict AST type, or the first error. */
export function requireValid<A, S = A>(
  parsed: Parsed<A>,
): Result<S, CompilationError> {
  return parsed.errors.length > 0
    ? Err(parsed.errors[0])
    : Ok(parsed.ast as unknown as S);
}

/**
 * Strict view of a parse result: the first error of a partial AST, or an
 * unrecovered failure, is an `Err`. Use where a valid AST is required. The
 * error carries `errors`, every error found, so editors can still list them.
 */
export function parseValid<A, S = A>(
  result: ParseResult<A>,
): Result<S, CompilationError> {
  if (isErr(result)) {
    return result;
  }
  const parsed = Ok(result);
  const strict = requireValid<A, S>(parsed);
  return isErr(strict)
    ? Err({ ...Err(strict), errors: parsed.errors })
    : strict;
}

/** Every error to display for one error, which may carry the full list. */
export function errorList(error?: CompilationError): CompilationError[] {
  return error ? (error.errors ?? [error]) : [];
}

let parserRecovery = false;

/** Feature flag, default false (today's behavior). */
export function setParserRecovery(enabled: boolean): void {
  parserRecovery = enabled;
}

export function isParserRecoveryEnabled(): boolean {
  return parserRecovery;
}

const UNKNOWN_HDL_ERROR = `HDL statement has a syntax error`;

export function createError(
  description: string,
  span?: Span,
): CompilationError {
  const match = description.match(/Line \d+, col \d+: (?<message>.*)/);
  const message = match?.groups?.message ? match.groups.message : description;
  return {
    message: `${
      span?.line != undefined ? `Line ${span.line}: ` : ""
    }${message}`,
    span: span,
  };
}

/** Recovery options that Ohm builds with Fallible accept; others ignore them. */
interface RecoveringGrammar {
  match(
    input: string,
    startRule?: string,
    options?: { recover: boolean },
  ): MatchResult;
}

function spanAt(source: string, position: number): Span {
  let line = 1;
  for (let i = 0; i < position && i < source.length; i++) {
    if (source[i] === "\n") line++;
  }
  return { start: position, end: position, line };
}

function recoveredErrors(
  source: string,
  match: MatchResult,
): CompilationError[] {
  const failures =
    (
      match as unknown as {
        getRecoveredFailures?(): { shortMessage: string; position: number }[];
      }
    ).getRecoveredFailures?.() ?? [];
  return failures.map((failure) =>
    createError(failure.shortMessage, spanAt(source, failure.position)),
  );
}

export function makeParser<ResultType>(
  grammar: Grammar,
  semantics: Semantics,
  property: (obj: Dict) => ResultType = ({ root }) => root,
): (source: string) => ParseResult<ResultType> {
  return function parse(source) {
    try {
      const recover = parserRecovery;
      const match = recover
        ? (grammar as unknown as RecoveringGrammar).match(source, undefined, {
            recover,
          })
        : grammar.match(source);
      const errors = recover ? recoveredErrors(source, match) : [];
      if (match.failed()) {
        const first = createError(
          match.shortMessage ?? UNKNOWN_HDL_ERROR,
          span(match.getInterval()),
        );
        // Today's first error leads the list; the final failure ends it.
        return Err(
          errors.length > 0
            ? { ...first, errors: [first, ...errors.slice(1)] }
            : first,
        );
      }
      const parsed = semantics(match);
      const ast = property(parsed);
      return Ok({ ast, errors });
    } catch (e) {
      return Err(e as Error);
    }
  };
}

export interface Span {
  start: number;
  end: number;
  line: number;
}

export function span(span: Interval): Span {
  return {
    start: span.startIdx,
    end: span.endIdx,
    line: span.getLineAndColumn().lineNum,
  };
}
