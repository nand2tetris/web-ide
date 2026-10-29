import { Err, Ok, Result } from "@davidsouther/jiffies/result.ts";
import { type Grammar, grammar, Interval, type Semantics } from "ohm-js";
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

/** One diagnostic: a message and, when known, where it applies. */
export interface Diagnostic {
  message: string;
  span?: Span;
}

/** One or more diagnostics, first error first. */
export type Diagnostics = readonly [Diagnostic, ...Diagnostic[]];

declare const valid: unique symbol;

/** A tree that parsed with no diagnostics. Only `makeParser` mints it. */
export type Valid<T> = T & { readonly [valid]: true };

/**
 * A parse outcome: a tree and its diagnostics. With no diagnostics the tree is
 * valid. Otherwise the tree is the language's null root.
 */
export type Outcome<T> =
  | { readonly ast: Valid<T>; readonly diagnostics: readonly [] }
  | { readonly ast: T; readonly diagnostics: Diagnostics };

/** A language's one entry point, and the null root a failed parse gives. */
export interface Parser<T> {
  parse(source: string): Outcome<T>;
  empty(): T;
}

/** True when the outcome has no diagnostics, so its tree is valid. */
export function isValid<T>(
  outcome: Outcome<T>,
): outcome is { readonly ast: Valid<T>; readonly diagnostics: readonly [] } {
  return outcome.diagnostics.length === 0;
}

/** The Result view of an outcome, for consumers that need a valid tree. */
export function validOf<T>(outcome: Outcome<T>): Result<Valid<T>, Diagnostics> {
  return isValid(outcome) ? Ok(outcome.ast) : Err(outcome.diagnostics);
}

/** The trust point: the only cast to `Valid`. */
function mint<T>(ast: T): Valid<T> {
  return ast as Valid<T>;
}

const UNKNOWN_HDL_ERROR = `HDL statement has a syntax error`;

export function createError(description: string, span?: Span): Diagnostic {
  const match = description.match(/Line \d+, col \d+: (?<message>.*)/);
  const message = match?.groups?.message ? match.groups.message : description;
  return {
    message: `${
      span?.line != undefined ? `Line ${span.line}: ` : ""
    }${message}`,
    span: span,
  };
}

/** A tree and its diagnostics, valid only when the list is empty. */
function outcomeOf<T>(ast: T, diagnostics: readonly Diagnostic[]): Outcome<T> {
  const [first, ...rest] = diagnostics;
  return first === undefined
    ? { ast: mint(ast), diagnostics: [] }
    : { ast, diagnostics: [first, ...rest] };
}

/**
 * A parser reading `attribute` from the semantics of a successful match. A
 * failed match or a thrown semantic error gives `empty()` as the tree.
 */
export function makeParser<T>(
  grammar: Grammar,
  semantics: Semantics,
  empty: () => T,
  attribute = "root",
): Parser<T> {
  return {
    empty,
    parse(source) {
      try {
        const match = grammar.match(source);
        if (match.failed()) {
          return outcomeOf(empty(), [
            createError(
              match.shortMessage ?? UNKNOWN_HDL_ERROR,
              span(match.getInterval()),
            ),
          ]);
        }
        // Ohm attributes are untyped, so the tree is taken to be `T`.
        const ast: T = semantics(match)[attribute];
        return outcomeOf(ast, []);
      } catch (e) {
        return outcomeOf(empty(), [e as Error]);
      }
    },
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
