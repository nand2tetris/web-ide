import { Err, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Dict,
  type Grammar,
  grammar,
  Interval,
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
  /** Every error found when recovery cannot finish, with this error first. */
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
  throw new Error("not implemented");
}

/** Turns a partial AST into the strict AST type, or the first error. */
export function requireValid<A, S>(
  parsed: Parsed<A>,
): Result<S, CompilationError> {
  throw new Error("not implemented");
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

export function makeParser<ResultType>(
  grammar: Grammar,
  semantics: Semantics,
  property: (obj: Dict) => ResultType = ({ root }) => root,
): (source: string) => Result<ResultType, CompilationError> {
  return function parse(source) {
    try {
      const match = grammar.match(source);
      if (match.failed()) {
        return Err(
          createError(
            match.shortMessage ?? UNKNOWN_HDL_ERROR,
            span(match.getInterval()),
          ),
        );
      }
      const parsed = semantics(match);
      const parse = property(parsed);
      return Ok(parse);
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
