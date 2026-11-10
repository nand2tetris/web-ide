import { Err, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Failure,
  type Grammar,
  grammar,
  Interval,
  type Semantics,
} from "ohm-js";
import { int2, int10, int16 } from "../util/twos.js";
import {
  type Diagnostic,
  type DiagnosticArgs,
  DiagnosticCode,
  type Diagnostics,
  diagnostic,
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
  /** Original grammar rule name. */
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

export function failedOf(
  diagnostic: Diagnostic,
  interval: Span,
  kind: string,
): Required<Recovery> {
  return { recovery: diagnostic, skipped: { kind, interval } };
}

export function recoveryOf(node: Recovery): Diagnostic | undefined {
  return node.recovery;
}

export function isRecovered(node: Recovery): boolean {
  return node.recovery !== undefined;
}

export function syntaxStageOf(
  failures: readonly Failure[],
): typeof Stage.LEX | typeof Stage.PARSE {
  // Classify the expectations shown in Ohm's error message.
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

declare const valid: unique symbol;

/** The parser returns this type only when there are no diagnostics. */
export type Valid<T> = T & { readonly [valid]: true };

/**
 * The parser retains the AST after `actionError` reports an error. A failed
 * match or an exception sets `ast` to `empty()` and `nullRoot` to true.
 */
export type Outcome<T> =
  | { readonly ast: Valid<T>; readonly diagnostics: readonly [] }
  | {
      readonly ast: T;
      readonly diagnostics: Diagnostics;
      readonly nullRoot?: true;
    };

export interface Parser<T> {
  parse(source: string): Outcome<T>;
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

function mint<T>(ast: T): Valid<T> {
  return ast as Valid<T>;
}

function syntaxDiagnostic(at: Span, failures: readonly Failure[]): Diagnostic {
  const expected = failures
    .filter((failure) => !failure.isFluffy())
    .map((failure) => failure.toString());
  return diagnostic(
    DiagnosticCode.Syntax.EXPECTED,
    { expected },
    at,
    syntaxStageOf(failures),
  );
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

function outcomeOf<T>(ast: T, diagnostics: readonly Diagnostic[]): Outcome<T> {
  const [first, ...rest] = diagnostics;
  return first === undefined
    ? { ast: mint(ast), diagnostics: [] }
    : { ast, diagnostics: [first, ...rest] };
}

function nullRootOf<T>(empty: T, diagnostics: Diagnostics): Outcome<T> {
  return { ast: empty, diagnostics, nullRoot: true };
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
    parse(source) {
      // Don't mix errors from nested parses.
      const outer = failedActions;
      const failed: Diagnostic[] = [];
      failedActions = failed;
      try {
        const match = grammar.match(source);
        if (match.failed()) {
          return nullRootOf(empty(), [
            syntaxDiagnostic(
              span(match.getInterval()),
              match.getRightmostFailures(),
            ),
          ]);
        }
        const ast: T = semantics(match)[attribute];
        return outcomeOf(ast, failed);
      } catch (e) {
        const [first, ...rest] = failed;
        const thrown = thrownDiagnostic(e);
        return nullRootOf(
          empty(),
          first === undefined ? [thrown] : [first, ...rest, thrown],
        );
      } finally {
        failedActions = outer;
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
