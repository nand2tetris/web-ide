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
import {
  type Diagnostic,
  type DiagnosticArgs,
  type DiagnosticCode,
  type Diagnostics,
  diagnostic,
  faultKey,
  type Span,
  type Stage,
} from "./diagnostic.js";

export {
  type Diagnostic,
  type DiagnosticArgs,
  type DiagnosticCode,
  type Diagnostics,
  describeEnglish,
  diagnostic,
  type Fault,
  fault,
  located,
  type Span,
  type Stage,
} from "./diagnostic.js";

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
 * What a null object stands in for: the grammar kind of the construct the tree
 * lost, the full interval of its input and, for a syntax recovery, the
 * recovery identity of the failure (the key `Origin.recovery` holds).
 */
export interface Skipped {
  /**
   * The construct that was lost, named by the action that built the null
   * object for the slot that recovered (for example `PartBody` for a skipped
   * HDL part, `TstRepeatClose` for a missing block closer), or by the action
   * that failed. It is never inferred from the null object's own type.
   */
  readonly kind: string;
  /** The full interval the tree lost, not the diagnostic's point. */
  readonly interval: Span;
  /** The recovery identity; absent when a semantic action failed. */
  readonly key?: string;
}

/**
 * A node type that a null object may stand in for. `recovery` is set only on
 * a null object, left where recovery skipped input or where a semantic action
 * failed, and it is the same object that the outcome lists in `diagnostics`.
 * `skipped` says what the null object stands in for.
 */
export interface Recovery {
  readonly recovery?: Diagnostic;
  readonly skipped?: Skipped;
}

/** A correction's diagnostic, skipped span, and recovery identity. */
export interface RecoveryPoint {
  readonly recovery: Diagnostic;
  readonly span: Span;
  readonly key: string;
}

/** Recovery of a guarded construct discarded in full, including matched input. */
export function guardedRecovery(
  guarded: Node,
  correction: Node,
): RecoveryPoint | undefined {
  const point: RecoveryPoint | undefined = correction.recovery;
  return point === undefined
    ? undefined
    : { ...point, span: { ...span(guarded.source), end: point.span.end } };
}

/** The fields of a null object for a recovered slot of grammar kind `kind`. */
export function carrierOf(
  { recovery, span, key }: RecoveryPoint,
  kind: string,
): Required<Recovery> {
  return { recovery, skipped: { kind, interval: span, key } };
}

/** The fields of a null object for a semantic action of kind `kind` that failed. */
export function failedOf(
  diagnostic: Diagnostic,
  interval: Span,
  kind: string,
): Required<Recovery> {
  return { recovery: diagnostic, skipped: { kind, interval } };
}

/**
 * A null object's provenance, captured from the tree before pruning drops it:
 * what it stands in for, its diagnostic, and its enclosing scopes, outermost
 * first (for example `["Main", "run"]` for a statement of `Main.run`).
 */
export interface Skip extends Skipped {
  readonly diagnostic: Diagnostic;
  readonly scope: readonly string[];
}

/** Every null object's provenance in a tree, in tree order. */
export type Provenance = readonly Skip[];

/**
 * A tree a parse built, pruned to `Valid`, beside the provenance of what
 * pruning dropped. Validators and dependency tables take this pair.
 */
export interface Recovered<T> {
  readonly ast: Valid<T>;
  readonly provenance: Provenance;
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
  | {
      readonly ast: T;
      readonly diagnostics: Diagnostics;
      /**
       * Set when the parse built no tree and `ast` is the language's null
       * root. Such a root takes the syntax-only path: it never enters a chip
       * or class table nor reaches a later stage (see `recoveredOf`).
       */
      readonly nullRoot?: true;
    };

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

/** A language's `prune`, and the capture of what it drops. */
export interface Prune<T> {
  (tree: T): Valid<T>;
  /** The provenance of every null object in the unpruned tree. */
  provenance(tree: T): Provenance;
}

/**
 * The scope a node opens, such as a class or subroutine name, or undefined
 * for a node that opens none.
 */
export type ScopeOf = (node: object) => string | undefined;

/**
 * A language's `prune`: `drop` removes the recovered items from each list,
 * then a run time walk checks that no recovered node remains before the tree
 * is minted `Valid`. `scopeOf` names the scopes that provenance records.
 */
export function makePrune<T>(
  drop: (tree: T) => T,
  scopeOf: ScopeOf = () => undefined,
): Prune<T> {
  const prune = (tree: T) => {
    const pruned = drop(tree);
    if (containsRecovered(pruned)) {
      throw new Error("prune left a recovered node outside a list");
    }
    return mint(pruned);
  };
  return Object.assign(prune, {
    provenance: (tree: T): Provenance => skipsIn(tree, [], scopeOf),
  });
}

/**
 * Run time walk: the provenance of every null object in the tree, in tree
 * order, each with the scopes that enclose it. A null object without
 * `skipped` was not built by a language's semantics and records nothing.
 */
function skipsIn(
  value: unknown,
  scope: readonly string[],
  scopeOf: ScopeOf,
): Skip[] {
  if (typeof value !== "object" || value === null) {
    return [];
  }
  const { recovery, skipped } = value as Recovery;
  if (recovery !== undefined) {
    return skipped === undefined
      ? []
      : [{ ...skipped, diagnostic: recovery, scope }];
  }
  const name = Array.isArray(value) ? undefined : scopeOf(value);
  const inner = name === undefined ? scope : [...scope, name];
  return Object.values(value).flatMap((child) =>
    skipsIn(child, inner, scopeOf),
  );
}

/**
 * The pruned tree and its provenance, or undefined for a null root: a parse
 * that built no tree contributes nothing to a chip or class table.
 */
export function recoveredOf<T>(
  outcome: Outcome<T>,
  prune: Prune<T>,
): Recovered<T> | undefined {
  return "nullRoot" in outcome && outcome.nullRoot
    ? undefined
    : { ast: prune(outcome.ast), provenance: prune.provenance(outcome.ast) };
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

/** A diagnostic of a check on a well formed program. */
export function semanticError<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  span?: Span,
): Diagnostic {
  return diagnostic(code, args, span, "semantic");
}

/**
 * The action errors of the parse running now, in the order the actions ran.
 * Like `linked`, `makeParser` sets this around the semantics.
 */
let failedActions: Diagnostic[] | undefined;

/**
 * A semantic action's error: a `semantic` diagnostic, listed in the outcome of
 * the parse running now. The action returns its language's null object with
 * it (see `failedOf`) instead of throwing, so the parse keeps its tree.
 */
export function actionError<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  at: Span,
): Diagnostic {
  const failed = semanticError(code, args, at);
  failedActions?.push(failed);
  return failed;
}

/**
 * What a merge knows about a diagnostic beyond its record, kept beside it
 * because `Diagnostic` has no field for it.
 */
export interface Origin {
  /**
   * Recovery identity: the key of the skipped interval that gave the record.
   * Records with equal code, arguments and span but different or absent keys stay apart.
   */
  readonly recovery?: string;
  /**
   * Cause link: records that share a cause key arose from one cause, whatever
   * their arguments or position, and merge into the first.
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
 * one when it is the same object, shares its cause key, or has the same code,
 * arguments, span and recovery key. Merging keeps the earlier record
 * unchanged, so an absent stage inherits nothing.
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
 * The baseline identity: code, arguments, complete span and recovery key. A
 * spanless record has none, since an equal problem alone is no evidence of
 * location.
 */
function identityOf(
  record: Diagnostic,
  origin: Origin | undefined,
): string | undefined {
  const { span } = record;
  return span === undefined
    ? undefined
    : JSON.stringify([
        faultKey(record),
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

/**
 * Ohm reports equal failures once, under this key (`distinctByPosition`). The
 * key is Ohm's own identity, so it stays whatever the diagnostic says.
 */
function failureKey(failure: RecoveredFailure): string {
  const { interval, position, shortMessage } = failure;
  return `${interval.startIdx}:${interval.endIdx}:${position}:${shortMessage}`;
}

/**
 * A syntax failure's diagnostic, tagged with the stage its failures show. It
 * expects what the failures expected, other than fluffy ones, which Ohm omits
 * from its own message.
 */
function syntaxDiagnostic(at: Span, failures: readonly Failure[]): Diagnostic {
  const shown = failures
    .filter((failure) => !failure.isFluffy())
    .map((failure) => failure.toString());
  return diagnostic(
    "syntax.expected",
    { expected: shown },
    at,
    syntaxStageOf(failures),
  );
}

function diagnosticOf(source: string, failure: RecoveredFailure): Diagnostic {
  return syntaxDiagnostic(
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
 * A correction slot's recovery point, or undefined when the slot is empty. Its
 * diagnostic is the outcome's own entry for the same failure. Outside a parse
 * by `makeParser`, an equal diagnostic is made from the failure.
 */
function recoveryFor(correction: Node): RecoveryPoint | undefined {
  const failure = correction.recoveredFailure;
  if (failure === undefined) {
    return undefined;
  }
  const recovery =
    linked?.get(failureKey(failure)) ??
    diagnosticOf(correction.source.sourceString, failure);
  return { recovery, span: span(correction.source), key: failureKey(failure) };
}

/**
 * Whether a slot recovered. A parent reads `slot.recovery` on its correction
 * slot and builds its null object from the result.
 */
baseSemantics.addAttribute<RecoveryPoint | undefined>("recovery", {
  _correction() {
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

/** Ohm's error for an operation that reaches a `_correction` node it has no action for. */
function isMissingCorrectionAction(e: unknown): boolean {
  return (
    e instanceof Error &&
    /Missing semantic action for _correction/.test(e.message)
  );
}

/** A tree and its diagnostics, valid only when the list is empty. */
function outcomeOf<T>(ast: T, diagnostics: readonly Diagnostic[]): Outcome<T> {
  const [first, ...rest] = diagnostics;
  return first === undefined
    ? { ast: mint(ast), diagnostics: [] }
    : { ast, diagnostics: [first, ...rest] };
}

/** The null root of a parse that built no tree, and why. */
function nullRootOf<T>(empty: T, diagnostics: Diagnostics): Outcome<T> {
  return { ast: empty, diagnostics, nullRoot: true };
}

/**
 * A thrown value as a diagnostic: a thrown diagnostic is kept, tagged
 * `semantic` when it has no stage, and any other error becomes a spanless
 * `semantic` diagnostic of code `error.unexpected` with its message.
 */
function thrownDiagnostic(e: unknown): Diagnostic {
  if (e instanceof Error) {
    return diagnostic(
      "error.unexpected",
      { message: e.message },
      undefined,
      "semantic",
    );
  }
  if (typeof e === "object" && e !== null && "code" in e && "args" in e) {
    const thrown = e as Diagnostic;
    return { ...thrown, stage: thrown.stage ?? "semantic" };
  }
  return diagnostic(
    "error.unexpected",
    { message: String(e) },
    undefined,
    "semantic",
  );
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
      // retain the recovered syntax errors and the earlier action errors.
      let diagnostics: Diagnostic[] = [];
      const failed: Diagnostic[] = [];
      const outer = linked;
      const outerActions = failedActions;
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
            span(match.getInterval()),
            match.getRightmostFailures(),
          );
          // The strict parse's first error stays first; the final failure ends the list.
          return nullRootOf(empty(), [first, ...diagnostics.slice(1)]);
        }
        linked = new Map(
          failures.map((f, i) => [failureKey(f), diagnostics[i]]),
        );
        failedActions = failed;
        // Ohm attributes are untyped, so the tree is taken to be `T`.
        const ast: T = semantics(match)[attribute];
        // Action errors follow the syntax diagnostics, so the first syntax
        // error stays first.
        return outcomeOf(ast, [...diagnostics, ...failed]);
      } catch (e) {
        if (isMissingCorrectionAction(e)) {
          throw e;
        }
        const [first, ...rest] = [...diagnostics, ...failed];
        const thrown = thrownDiagnostic(e);
        return nullRootOf(
          empty(),
          first === undefined ? [thrown] : [first, ...rest, thrown],
        );
      } finally {
        linked = outer;
        failedActions = outerActions;
      }
    },
  };
}

export function span(span: Interval): Span {
  return {
    start: span.startIdx,
    end: span.endIdx,
    line: span.getLineAndColumn().lineNum,
  };
}
