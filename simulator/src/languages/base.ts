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
  type Fault,
  faultKey,
  located,
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

/**
 * Includes a discarded guarded prefix without moving the diagnostic. A
 * zero-width inferred join retains the guard and returns undefined. For an
 * inferred join with a nonempty skipped tail, callers retaining the guard can
 * record the tail with `attachTrailingSkip`.
 */
export function guardedRecovery(
  guarded: Node,
  correction: Node,
): RecoveryPoint | undefined {
  // A zero-width inferred join keeps the guarded values and discards no input.
  if (
    correction.recoveredFailure?.missing &&
    correction.source.contents === ""
  ) {
    return undefined;
  }
  const point: RecoveryPoint | undefined = correction.recovery;
  return point === undefined
    ? undefined
    : { ...point, span: { ...span(guarded.source), end: point.span.end } };
}

// A retained node may have skipped trailing text before an inferred join.
// Keep that provenance separate from recovered placeholders, which are pruned.
// Entries live with the raw AST object identity. Capture provenance before
// cloning or serialization, which do not preserve this side table.
const trailingSkips = new WeakMap<
  object,
  { point: RecoveryPoint; kind: string }[]
>();

export function attachTrailingSkip<T extends object>(
  value: T,
  correction: Node,
  kind: string,
): T {
  if (
    correction.recoveredFailure?.missing &&
    correction.source.contents !== ""
  ) {
    const point: RecoveryPoint | undefined = correction.recovery;
    if (point) {
      const existing = trailingSkips.get(value) ?? [];
      if (
        !existing.some(
          (tail) => tail.kind === kind && tail.point.key === point.key,
        )
      ) {
        trailingSkips.set(value, [...existing, { point, kind }]);
      }
    }
  }
  return value;
}

/** Preserve correction metadata when an intermediate AST node is collapsed. */
export function transferTrailingSkips(from: object, to: object): void {
  const tails = trailingSkips.get(from);
  if (tails)
    trailingSkips.set(to, [...(trailingSkips.get(to) ?? []), ...tails]);
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

export function skipsAny(
  provenance: Provenance,
  kinds: ReadonlySet<string>,
): boolean {
  return provenance.some(({ kind }) => kinds.has(kind));
}

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
  /**
   * Opt-in. When set, a syntax error is recovered so later checks run on the
   * rest of the source; the result then carries diagnostics and no executable
   * output. Strict parsing is the default.
   */
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
  const own = (trailingSkips.get(value) ?? []).map(({ point, kind }) => ({
    kind,
    interval: point.span,
    key: point.key,
    diagnostic: point.recovery,
    scope: inner,
  }));
  return [
    ...own,
    ...Object.values(value).flatMap((child) => skipsIn(child, inner, scopeOf)),
  ];
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
 * The scope in which a repeated fault is shown once, or undefined to keep
 * every repeat. Scope names are compared as strings.
 */
export type DedupeScope = (diagnostic: Diagnostic) => string | undefined;

/** Syntax diagnostics repeat within one line; other stages are kept. */
export const lineScope: DedupeScope = ({ span, stage }) =>
  span !== undefined && (stage === Stage.LEX || stage === Stage.PARSE)
    ? `line ${span.line}`
    : undefined;

/**
 * Merge one file at a time. Sort by position, then stage, then input order.
 * Equal code, arguments, complete span and recovery ID merge; spanless
 * records merge only by object identity or a shared cause. With `scopeOf`,
 * equal code and arguments also merge within one scope. Keep the first.
 */
export function mergeDiagnostics(
  diagnostics: Diagnostics,
  origins?: Origins,
  scopeOf?: DedupeScope,
): Diagnostics {
  const sorted = [...diagnostics].sort(byPosition);
  const [first] = sorted;
  const kept = new Set<Diagnostic>();
  const identities = new Set<string>();
  const causes = new Set<string>();
  const scoped = new Set<string>();
  for (const diagnostic of sorted) {
    const origin = origins?.get(diagnostic);
    const identity = identityOf(diagnostic, origin);
    const scope = scopeOf?.(diagnostic);
    const inScope =
      scope === undefined
        ? undefined
        : JSON.stringify([scope, faultKey(diagnostic)]);
    const repeats =
      kept.has(diagnostic) ||
      (origin?.cause !== undefined && causes.has(origin.cause)) ||
      (identity !== undefined && identities.has(identity)) ||
      (inScope !== undefined && scoped.has(inScope));
    if (!repeats) {
      kept.add(diagnostic);
      if (identity !== undefined) identities.add(identity);
      if (origin?.cause !== undefined) causes.add(origin.cause);
      if (inScope !== undefined) scoped.add(inScope);
    }
  }
  // Nothing precedes the first diagnostic, so it is always kept.
  const [, ...others] = kept;
  return [first, ...others];
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

/**
 * Where a syntax failure occurred: the parsed source and the rightmost failure
 * offset. The reported span can start earlier, after the preceding token.
 */
export interface SyntaxSite {
  source: string;
  position: number;
}

/**
 * What a syntax failure reports: an expectation list, shown as `expected …`,
 * or a fault that replaces that wording.
 */
export type SyntaxReading = readonly string[] | Fault;

/** Applied to strict and recovered failures; includes Ohm's hidden expectations. */
export type SyntaxExpected = (
  expected: readonly string[],
  failures: readonly Failure[],
  site: SyntaxSite,
) => SyntaxReading;

/** One rewrite of an expectation list; undefined when the rule does not apply. */
export type SyntaxRewrite = (
  expected: readonly string[],
  failures: readonly Failure[],
  site: SyntaxSite,
) => SyntaxReading | undefined;

const ohmExpected: SyntaxExpected = (expected) => expected;

/**
 * Applies `rules` in order. Each applicable rule replaces the list, and later
 * rules see its output. A rule that returns a fault ends the chain.
 */
export function rewrites(...rules: SyntaxRewrite[]): SyntaxExpected {
  return (expected, failures, site) =>
    rules.reduce<SyntaxReading>(
      (current, rule) =>
        isExpectation(current)
          ? (rule(current, failures, site) ?? current)
          : current,
      expected,
    );
}

function isExpectation(reading: SyntaxReading): reading is readonly string[] {
  return Array.isArray(reading);
}

const WORD = /^[A-Za-z_.$:][\w.$:-]*/;

/** Suggests a uniquely closest expected literal for a case or one-edit typo. */
export function didYouMean(words: readonly string[]): SyntaxRewrite {
  return (_expected, failures, { source, position }) => {
    const word = WORD.exec(source.slice(position))?.[0];
    if (!word || words.includes(word)) return undefined;
    const candidates = words.filter((candidate) =>
      failures.some(
        (failure) =>
          !failure.isFluffy() &&
          failure.toString() === JSON.stringify(candidate),
      ),
    );
    const folded = word.toLowerCase();
    const exactCase = candidates.filter(
      (candidate) => candidate.toLowerCase() === folded,
    );
    const close = exactCase.length
      ? exactCase
      : candidates.filter((candidate) =>
          oneEditApart(folded, candidate.toLowerCase()),
        );
    return close.length === 1
      ? {
          code: DiagnosticCode.Syntax.DID_YOU_MEAN,
          args: { word, suggestion: close[0] },
        }
      : undefined;
  };
}

/** One insertion, deletion, substitution, or adjacent transposition. */
function oneEditApart(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) {
    if (a.slice(i + 1) === b.slice(i + 1)) return true;
    return (
      a[i] === b[i + 1] &&
      a[i + 1] === b[i] &&
      a.slice(i + 2) === b.slice(i + 2)
    );
  }
  return a.length > b.length
    ? a.slice(i + 1) === b.slice(i)
    : a.slice(i) === b.slice(i + 1);
}

/**
 * Reports `unknown <kind> <word>` when the failure stands at the start of a
 * word that is not in `words`, where Ohm tried one of `words`. The kind is
 * `label` without its article: `a command` gives `unknown command psh`.
 */
export function unknownWord(
  label: string,
  words: readonly string[],
): SyntaxRewrite {
  const quoted = new Set(words.map((word) => JSON.stringify(word)));
  const kind = label.replace(/^an? /, "");
  return (_expected, failures, { source, position }) => {
    const word = WORD.exec(source.slice(position))?.[0];
    const tried = failures.some((failure) => quoted.has(failure.toString()));
    return word === undefined || !tried || words.includes(word)
      ? undefined
      : { code: DiagnosticCode.Syntax.UNKNOWN_WORD, args: { kind, word } };
  };
}

/**
 * Reports `Syntax.NAME` when the failure stands at a reserved word, where a
 * name was expected: one of `names`, the descriptions of name rules.
 */
export function reservedName(
  reserved: readonly string[],
  names: readonly string[],
): SyntaxRewrite {
  return (expected, _failures, { source, position }) => {
    const word = WORD.exec(source.slice(position))?.[0];
    return word !== undefined &&
      reserved.includes(word) &&
      expected.some((item) => names.includes(item))
      ? { code: DiagnosticCode.Syntax.NAME, args: { word, reason: "reserved" } }
      : undefined;
  };
}

/**
 * Replaces the expectations found in `set` with `label`, placed first. An
 * entry of `set` matches an expectation either as Ohm quotes a literal
 * (`"eval"`) or as an unquoted description (`end of input`).
 */
export function categorize(
  set: readonly string[],
  label: string,
): SyntaxRewrite {
  const members = new Set(set.flatMap((word) => [word, JSON.stringify(word)]));
  return (expected) => {
    const rest = expected.filter((item) => !members.has(item));
    return rest.length === expected.length ? undefined : [label, ...rest];
  };
}

/**
 * Ohm fails after the whitespace that follows the last matched token, so a
 * missing delimiter lands on the next token, possibly on the next line. When
 * only punctuation was expected, step back over that whitespace. When a word
 * was expected, the next token is the mistake and stays where it is.
 */
function errorPosition(
  source: string,
  position: number,
  expected: readonly string[],
): number {
  const onlyPunctuation =
    expected.length > 0 && expected.every((item) => /^"[^\w"]+"$/.test(item));
  if (!onlyPunctuation) {
    return position;
  }
  let at = position;
  while (at > 0 && /\s/.test(source[at - 1])) {
    at--;
  }
  return at;
}

function syntaxDiagnostic(
  source: string,
  at: Span,
  position: number,
  failures: readonly Failure[],
  expectedOf: SyntaxExpected = ohmExpected,
): Diagnostic {
  const shown = failures
    .filter((failure) => !failure.isFluffy())
    .map((failure) => failure.toString());
  const reading = expectedOf(shown, failures, { source, position });
  const stage = syntaxStageOf(failures);
  // A rewritten fault names the word at the failure, so it is located there.
  return isExpectation(reading)
    ? located(
        { code: DiagnosticCode.Syntax.EXPECTED, args: { expected: reading } },
        at.start === at.end
          ? spanAt(source, errorPosition(source, at.start, reading))
          : at,
        stage,
      )
    : located(reading, spanAt(source, position), stage);
}

function diagnosticOf(
  source: string,
  failure: RecoveredFailure,
  expectedOf: SyntaxExpected = ohmExpected,
): Diagnostic {
  return syntaxDiagnostic(
    source,
    spanAt(source, failure.getDiagnosticPosition()),
    failure.position,
    failure.getRightmostFailures(),
    expectedOf,
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

/**
 * Recovery can fail repeatedly on one line, each time with the same message.
 * Later failures share the first one's diagnostic, so lists drop repeats.
 */
function sameLineOnce(found: Diagnostic[]): Diagnostic[] {
  const first = new Map<string, Diagnostic>();
  return found.map((one) => {
    const key = JSON.stringify([one.code, one.args, one.span?.line, one.stage]);
    const seen = first.get(key);
    if (seen !== undefined) {
      return seen;
    }
    first.set(key, one);
    return one;
  });
}

function outcomeOf<T>(ast: T, diagnostics: readonly Diagnostic[]): Outcome<T> {
  const [first, ...rest] = [...new Set(diagnostics)];
  return first === undefined
    ? { ast: mint(ast), diagnostics: [] }
    : { ast, diagnostics: [first, ...rest] };
}

function nullRootOf<T>(empty: T, diagnostics: Diagnostics): Outcome<T> {
  return {
    ast: empty,
    diagnostics: [...new Set(diagnostics)] as unknown as Diagnostics,
    nullRoot: true,
  };
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
  expectedOf: SyntaxExpected = ohmExpected,
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
        diagnostics = sameLineOnce(
          failures.map((f) => diagnosticOf(source, f, expectedOf)),
        );
        if (match.failed()) {
          const first = syntaxDiagnostic(
            source,
            span(match.getInterval()),
            match.getRightmostFailurePosition(),
            match.getRightmostFailures(),
            expectedOf,
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
