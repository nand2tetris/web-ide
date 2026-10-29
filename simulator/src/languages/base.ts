import { Err, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Failure,
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

/**
 * The stage that found a diagnostic: `lex` for a malformed token, `parse` for
 * missing or unexpected input, `semantic` for a well formed but invalid
 * program, and `compile` for a failure while generating output.
 */
export type Stage = "lex" | "parse" | "semantic" | "compile";

/** One diagnostic: a message and, when known, where it applies. */
export interface Diagnostic {
  message: string;
  span?: Span;
  stage?: Stage;
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

/** Options of a low-level parse. */
export interface ParseOptions {
  /** Recover from syntax errors to keep parsing. Default false. */
  attemptRecovery?: boolean;
}

/** A language's one entry point, and the null root a failed parse gives. */
export interface Parser<T> {
  parse(source: string, options?: ParseOptions): Outcome<T>;
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

/**
 * The stage of a syntax failure from its expected failures: `lex` when every
 * expectation shown in the message failed inside a token that had begun, and
 * `parse` otherwise, including mixed and empty expectations.
 */
export function syntaxStageOf(failures: readonly Failure[]): "lex" | "parse" {
  const shown = failures.filter((failure) => !failure.isFluffy());
  return shown.length > 0 && shown.every((failure) => failure.isLexical())
    ? "lex"
    : "parse";
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

/**
 * What a merge knows about a diagnostic beyond its record, kept beside it
 * because `Diagnostic` has no field for it.
 */
export interface Origin {
  /**
   * Recovery identity: the key of the skipped interval that gave the record.
   * Records with equal message and span but different or absent keys stay apart.
   */
  readonly recovery?: string;
  /**
   * Cause link: records that share a cause key arose from one cause, whatever
   * their wording or position, and merge into the first.
   */
  readonly cause?: string;
}

/** The origins of diagnostics, by record. A record without an entry has none. */
export type Origins = ReadonlyMap<Diagnostic, Origin>;

/**
 * One source file's diagnostics, ordered and deduplicated for display.
 *
 * Order: span start, spanless last, then stage (`lex`, `parse`, `semantic`,
 * `compile`, absent last), then input order. A record merges into an earlier
 * one when it is the same object, shares its cause key, or has the same message,
 * span and recovery key. Merging keeps the earlier record unchanged, so an
 * absent stage inherits nothing. Spanless records otherwise stay. Differently
 * worded records stay unless a cause key links them.
 *
 * Call once per file: records of different files never merge (see `mergeByFile`).
 */
export function mergeDiagnostics(
  diagnostics: Diagnostics,
  origins?: Origins,
): Diagnostics;
export function mergeDiagnostics(
  diagnostics: readonly Diagnostic[],
  origins?: Origins,
): readonly Diagnostic[];
export function mergeDiagnostics(
  diagnostics: readonly Diagnostic[],
  origins?: Origins,
): readonly Diagnostic[] {
  const kept = new Set<Diagnostic>();
  const identities = new Set<string>();
  const causes = new Set<string>();
  for (const diagnostic of [...diagnostics].sort(byPosition)) {
    const origin = origins?.get(diagnostic);
    const identity = identityOf(diagnostic, origin);
    const repeats =
      kept.has(diagnostic) ||
      (origin?.cause !== undefined && causes.has(origin.cause)) ||
      (identity !== undefined && identities.has(identity));
    if (!repeats) {
      kept.add(diagnostic);
      if (identity !== undefined) identities.add(identity);
      if (origin?.cause !== undefined) causes.add(origin.cause);
    }
  }
  return [...kept];
}

/**
 * The baseline identity: exact message, complete span and recovery key. A
 * spanless record has none, since equal text alone is no evidence of location.
 */
function identityOf(
  { message, span }: Diagnostic,
  origin: Origin | undefined,
): string | undefined {
  return span === undefined
    ? undefined
    : JSON.stringify([
        message,
        span.start,
        span.end,
        span.line,
        origin?.recovery ?? null,
      ]);
}

const STAGE_ORDER: readonly Stage[] = ["lex", "parse", "semantic", "compile"];

/** Position of a stage in the pipeline; an absent stage sorts after every one. */
function stageRank(stage: Stage | undefined): number {
  return stage === undefined ? STAGE_ORDER.length : STAGE_ORDER.indexOf(stage);
}

/**
 * Span start first with spanless last, then stage. Array sort is stable, so
 * the remaining ties keep input order.
 */
function byPosition(a: Diagnostic, b: Diagnostic): number {
  const starts = Number(a.span === undefined) - Number(b.span === undefined);
  return (
    starts ||
    (a.span && b.span ? a.span.start - b.span.start : 0) ||
    stageRank(a.stage) - stageRank(b.stage)
  );
}

/** `mergeDiagnostics` for each file of a keyed list, never across files. */
export function mergeByFile(
  files: Readonly<Record<string, Diagnostics>>,
  origins?: Origins,
): Record<string, Diagnostics> {
  return Object.fromEntries(
    Object.entries(files).map(([file, diagnostics]) => [
      file,
      mergeDiagnostics(diagnostics, origins),
    ]),
  );
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

/** A syntax failure's diagnostic, tagged with the stage its failures show. */
function syntaxDiagnostic(
  message: string,
  at: Span,
  failures: readonly Failure[],
): Diagnostic {
  return { ...createError(message, at), stage: syntaxStageOf(failures) };
}

function diagnosticOf(source: string, failure: RecoveredFailure): Diagnostic {
  return syntaxDiagnostic(
    failure.shortMessage,
    spanAt(source, failure.position),
    failure.getRightmostFailures(),
  );
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
    parse(source, options) {
      // Share diagnostics across try and catch so semantic conversion failures
      // retain the recovered syntax errors.
      let diagnostics: Diagnostic[] = [];
      const outer = linked;
      try {
        const recover = options?.attemptRecovery ?? false;
        const match = recover
          ? (grammar as unknown as RecoveringGrammar).match(source, undefined, {
              recover,
            })
          : grammar.match(source);
        const failures = recover ? match.getRecoveredFailures() : [];
        diagnostics = failures.map((f) => diagnosticOf(source, f));
        if (match.failed()) {
          const first = syntaxDiagnostic(
            match.shortMessage ?? UNKNOWN_HDL_ERROR,
            span(match.getInterval()),
            match.getRightmostFailures(),
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
