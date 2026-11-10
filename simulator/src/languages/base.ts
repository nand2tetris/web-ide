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
  DiagnosticCode,
  type Diagnostics,
  diagnostic,
  faultKey,
  type Span,
  Stage,
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

export interface Skipped {
  /** A rule name or language-defined recovery tag. */
  readonly kind: string;
  /** Full source range of the failed node. The diagnostic may cover less. */
  readonly interval: Span;
  /** Recovery ID; absent for semantic errors. */
  readonly key?: string;
}

/** Failed nodes reference the same diagnostic listed in the parse outcome. */
export interface Recovery {
  readonly recovery?: Diagnostic;
  readonly skipped?: Skipped;
}

/** `span` covers discarded input; `recovery.span` locates the failure. */
export interface RecoveryPoint {
  readonly recovery: Diagnostic;
  readonly span: Span;
  readonly key: string;
}

/** Includes the discarded guarded prefix without moving the diagnostic. */
export function guardedRecovery(
  guarded: Node,
  correction: Node,
): RecoveryPoint | undefined {
  const point: RecoveryPoint | undefined = correction.recovery;
  return point === undefined
    ? undefined
    : { ...point, span: { ...span(guarded.source), end: point.span.end } };
}

export function carrierOf(
  { recovery, span, key }: RecoveryPoint,
  kind: string,
): Required<Recovery> {
  return { recovery, skipped: { kind, interval: span, key } };
}

export function failedOf(
  diagnostic: Diagnostic,
  interval: Span,
  kind: string,
): Required<Recovery> {
  return { recovery: diagnostic, skipped: { kind, interval } };
}

/** Capture before pruning; scopes are ordered outermost first. */
export interface Skip extends Skipped {
  readonly diagnostic: Diagnostic;
  readonly scope: readonly string[];
}

export type Provenance = readonly Skip[];

export interface Recovered<T> {
  readonly ast: Valid<T>;
  readonly provenance: Provenance;
}

export function recoveryOf(node: Recovery): Diagnostic | undefined {
  return node.recovery;
}

export function isRecovered(node: Recovery): boolean {
  return node.recovery !== undefined;
}

declare const valid: unique symbol;

/** Contains no recovered nodes; semantic validation may still report errors. */
export type Valid<T> = T & { readonly [valid]: true };

/** `nullRoot` marks an empty fallback; callers must skip semantic checks. */
export type Outcome<T> =
  | { readonly ast: Valid<T>; readonly diagnostics: readonly [] }
  | {
      readonly ast: T;
      readonly diagnostics: Diagnostics;
      readonly nullRoot?: true;
    };

export interface ParseOptions {
  /** Default false. */
  attemptRecovery?: boolean;
}

export interface Parser<T> {
  parse(source: string, options?: ParseOptions): Outcome<T>;
  empty(): T;
}

export function isValid<T>(
  outcome: Outcome<T>,
): outcome is { readonly ast: Valid<T>; readonly diagnostics: readonly [] } {
  return outcome.diagnostics.length === 0;
}

export function validOf<T>(outcome: Outcome<T>): Result<Valid<T>, Diagnostics> {
  return isValid(outcome) ? Ok(outcome.ast) : Err(outcome.diagnostics);
}

export interface Prune<T> {
  (tree: T): Valid<T>;
  provenance(tree: T): Provenance;
}

export type ScopeOf = (node: object) => string | undefined;

/** `drop` must remove every recovered node, including nodes inside arrays. */
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

/** A null root cannot proceed to semantic validation. */
export function recoveredOf<T>(
  outcome: Outcome<T>,
  prune: Prune<T>,
): Recovered<T> | undefined {
  return "nullRoot" in outcome && outcome.nullRoot
    ? undefined
    : { ast: prune(outcome.ast), provenance: prune.provenance(outcome.ast) };
}

function containsRecovered(value: unknown): boolean {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return Object.entries(value).some(([key, child]) =>
    key === "recovery" ? child !== undefined : containsRecovered(child),
  );
}

function mint<T>(ast: T): Valid<T> {
  return ast as Valid<T>;
}

/** Lexical only when every displayed expectation failed inside a token. */
export function syntaxStageOf(
  failures: readonly Failure[],
): typeof Stage.LEX | typeof Stage.PARSE {
  const shown = failures.filter((failure) => !failure.isFluffy());
  return shown.length > 0 && shown.every((failure) => failure.isLexical())
    ? Stage.LEX
    : Stage.PARSE;
}

export function semanticError<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  span?: Span,
): Diagnostic {
  return diagnostic(code, args, span, Stage.SEMANTIC);
}

let failedActions: Diagnostic[] | undefined;

/** Reports an error without throwing, so the action can return a null object. */
export function actionError<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  at: Span,
): Diagnostic {
  const failed = semanticError(code, args, at);
  failedActions?.push(failed);
  return failed;
}

export interface Origin {
  /** Distinct recovery IDs keep otherwise equal diagnostics separate. */
  readonly recovery?: string;
  /** Diagnostics sharing a cause merge even when their contents differ. */
  readonly cause?: string;
}

export type Origins = ReadonlyMap<Diagnostic, Origin>;

export function originsOf(provenance: Provenance): [Diagnostic, Origin][] {
  return provenance.flatMap(({ diagnostic, key }): [Diagnostic, Origin][] =>
    key === undefined ? [] : [[diagnostic, { recovery: key }]],
  );
}

/**
 * Merge one file at a time. Sort by position, then stage, then input order.
 * Equal code, arguments, complete span and recovery ID merge; spanless
 * records merge only by object identity or a shared cause. Keep the first.
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

const STAGE_ORDER: readonly Stage[] = [
  Stage.LEX,
  Stage.PARSE,
  Stage.SEMANTIC,
  Stage.COMPILE,
];

function stageRank(stage: Stage | undefined): number {
  return stage === undefined ? STAGE_ORDER.length : STAGE_ORDER.indexOf(stage);
}

function byPosition(a: Diagnostic, b: Diagnostic): number {
  const starts = Number(a.span === undefined) - Number(b.span === undefined);
  return (
    starts ||
    (a.span && b.span ? a.span.start - b.span.start : 0) ||
    stageRank(a.stage) - stageRank(b.stage)
  );
}

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

function failureKey(failure: RecoveredFailure): string {
  const { interval, position, shortMessage } = failure;
  return `${interval.startIdx}:${interval.endIdx}:${position}:${shortMessage}`;
}

function syntaxDiagnostic(at: Span, failures: readonly Failure[]): Diagnostic {
  const shown = failures
    .filter((failure) => !failure.isFluffy())
    .map((failure) => failure.toString());
  return diagnostic(
    DiagnosticCode.Syntax.EXPECTED,
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

// Scoped around semantic evaluation; nested parses restore the outer links.
let linked: Map<string, Diagnostic> | undefined;

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

/** Only correction slots expose recovery metadata. */
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

function isMissingCorrectionAction(e: unknown): boolean {
  return (
    e instanceof Error &&
    /Missing semantic action for _correction/.test(e.message)
  );
}

function outcomeOf<T>(ast: T, diagnostics: readonly Diagnostic[]): Outcome<T> {
  const [first, ...rest] = diagnostics;
  return first === undefined
    ? { ast: mint(ast), diagnostics: [] }
    : { ast, diagnostics: [first, ...rest] };
}

function nullRootOf<T>(empty: T, diagnostics: Diagnostics): Outcome<T> {
  return { ast: empty, diagnostics, nullRoot: true };
}

function thrownDiagnostic(e: unknown): Diagnostic {
  if (e instanceof Error) {
    return diagnostic(
      DiagnosticCode.Error.UNEXPECTED,
      { message: e.message },
      undefined,
      Stage.SEMANTIC,
    );
  }
  if (typeof e === "object" && e !== null && "code" in e && "args" in e) {
    const thrown = e as Diagnostic;
    return { ...thrown, stage: thrown.stage ?? Stage.SEMANTIC };
  }
  return diagnostic(
    DiagnosticCode.Error.UNEXPECTED,
    { message: String(e) },
    undefined,
    Stage.SEMANTIC,
  );
}

/** T must match the value returned by the selected semantic attribute. */
export function makeParser<T>(
  grammar: Grammar,
  semantics: Semantics,
  empty: () => T,
  attribute = "root",
): Parser<T> {
  return {
    empty,
    parse(source, options) {
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
          return nullRootOf(empty(), [first, ...diagnostics.slice(1)]);
        }
        linked = new Map(
          failures.map((f, i) => [failureKey(f), diagnostics[i]]),
        );
        failedActions = failed;
        const ast: T = semantics(match)[attribute];
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
