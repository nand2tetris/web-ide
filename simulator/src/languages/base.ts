import { Err, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Grammar,
  grammar,
  Interval,
  type MatchResult,
  type Node,
  type RecoveredFailure,
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

/** One diagnostic: a message and, when known, where it applies. */
export interface Diagnostic {
  message: string;
  span?: Span;
}

/** One or more diagnostics, first error first. */
export type Diagnostics = readonly [Diagnostic, ...Diagnostic[]];

/**
 * A node type that recovery may stand in for. `recovery` is set only on a null
 * object that recovery left where input was skipped, and it is the same object
 * that the outcome lists in `diagnostics`.
 */
export interface Recovery {
  readonly recovery?: Diagnostic;
}

/** What a `_fail` node gives its parent: the diagnostic and the skipped span. */
export interface RecoveryPoint {
  readonly recovery: Diagnostic;
  readonly span: Span;
}

/** The diagnostic of a null object, or undefined for a node a valid parse made. */
export function recoveryOf(node: Recovery): Diagnostic | undefined {
  return node.recovery;
}

/** True for a null object that recovery left where input was skipped. */
export function isRecovered(node: Recovery): boolean {
  return node.recovery !== undefined;
}

declare const valid: unique symbol;

/** A tree with no recovered node. Only `makeParser` and `makePrune` mint it. */
export type Valid<T> = T & { readonly [valid]: true };

/**
 * A parse outcome: a tree and its diagnostics. With no diagnostics the tree is
 * valid. Otherwise the tree holds null objects where recovery skipped input,
 * or is the language's null root when the parse built no tree.
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

/**
 * A language's `prune`: `drop` removes the recovered items from each list,
 * then a run time walk checks that no recovered node remains before the tree
 * is minted `Valid`.
 */
export function makePrune<T>(drop: (tree: T) => T): (tree: T) => Valid<T> {
  return (tree) => {
    const pruned = drop(tree);
    if (containsRecovered(pruned)) {
      throw new Error("prune left a recovered node outside a list");
    }
    return mint(pruned);
  };
}

/** Run time walk: true when any object in the tree carries `recovery`. */
function containsRecovered(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some(containsRecovered);
  }
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.entries(value).some(([key, child]) =>
    key === "recovery" ? child !== undefined : containsRecovered(child),
  );
}

/** The trust point: the only cast to `Valid`. */
function mint<T>(ast: T): Valid<T> {
  return ast as Valid<T>;
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

/** Ohm reports equal failures once, under this key (`distinctByPosition`). */
function failureKey(failure: RecoveredFailure): string {
  const { interval, position, shortMessage } = failure;
  return `${interval.startIdx}:${interval.endIdx}:${position}:${shortMessage}`;
}

function diagnosticOf(source: string, failure: RecoveredFailure): Diagnostic {
  return createError(failure.shortMessage, spanAt(source, failure.position));
}

/**
 * The diagnostics of the parse running now, by failure key. Ohm gives a node
 * no route back to its match, so `makeParser` sets this around the semantics.
 */
let linked: Map<string, Diagnostic> | undefined;

/**
 * A `_fail` node's recovery point, or undefined for an empty placeholder. Its
 * diagnostic is the outcome's own entry for the same failure. Outside a parse
 * by `makeParser`, an equal diagnostic is made from the failure.
 */
function recoveryFor(fail: Node): RecoveryPoint | undefined {
  const failure = fail.recoveredFailure;
  if (failure === undefined) {
    return undefined;
  }
  const recovery =
    linked?.get(failureKey(failure)) ??
    diagnosticOf(fail.source.sourceString, failure);
  return { recovery, span: span(fail.source) };
}

/**
 * Whether a slot recovered. A parent reads `slot.recovery` on its synchronizer
 * slot and builds its null object from the result.
 */
baseSemantics.addAttribute<RecoveryPoint | undefined>("recovery", {
  _fail() {
    return recoveryFor(this);
  },
  _nonterminal() {
    return undefined;
  },
  _terminal() {
    return undefined;
  },
  _iter() {
    return undefined;
  },
});

/** Ohm's error for an operation that reaches a `_fail` node it has no action for. */
function isMissingFailAction(e: unknown): boolean {
  return (
    e instanceof Error && /Missing semantic action for _fail/.test(e.message)
  );
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
      // Share diagnostics across try and catch so semantic conversion failures
      // retain the recovered syntax errors.
      let diagnostics: Diagnostic[] = [];
      const outer = linked;
      try {
        const recover = parserRecovery;
        const match = recover
          ? (grammar as unknown as RecoveringGrammar).match(source, undefined, {
              recover,
            })
          : grammar.match(source);
        const failures = recover ? match.getRecoveredFailures() : [];
        diagnostics = failures.map((f) => diagnosticOf(source, f));
        if (match.failed()) {
          const first = createError(
            match.shortMessage ?? UNKNOWN_HDL_ERROR,
            span(match.getInterval()),
          );
          // Today's first error leads the list; the final failure ends it.
          return outcomeOf(empty(), [first, ...diagnostics.slice(1)]);
        }
        linked = new Map(
          failures.map((f, i) => [failureKey(f), diagnostics[i]]),
        );
        // Ohm attributes are untyped, so the tree is taken to be `T`.
        const ast: T = semantics(match)[attribute];
        return outcomeOf(ast, diagnostics);
      } catch (e) {
        if (isMissingFailAction(e)) {
          throw e;
        }
        return outcomeOf(empty(), [...diagnostics, e as Error]);
      } finally {
        linked = outer;
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
