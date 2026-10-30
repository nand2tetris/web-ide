import { Err, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Dict,
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

/** A diagnostic of a check on a well formed program. */
export function semanticError<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  span?: Span,
): Diagnostic {
  return diagnostic(code, args, span, Stage.SEMANTIC);
}

/**
 * The action errors of the parse running now, in the order the actions ran.
 * `makeParser` sets this around the semantics.
 */
let failedActions: Diagnostic[] | undefined;

/**
 * A semantic action's error: a `semantic` diagnostic that the parse running now
 * ends with. The action returns a placeholder of its own instead of throwing.
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

/** A syntax failure's public expected text, retaining its failure span. */
function syntaxDiagnostic(at: Span, expected: string): Diagnostic {
  return diagnostic(
    DiagnosticCode.Syntax.EXPECTED,
    { expected: [expected] },
    at,
    Stage.PARSE,
  );
}

/**
 * A thrown value as a diagnostic: a thrown diagnostic is kept, tagged
 * `semantic` when it has no stage, and any other value becomes a spanless
 * `semantic` diagnostic of code `error.unexpected` with its message.
 */
function thrownDiagnostic(e: unknown): Diagnostic {
  if (typeof e === "object" && e !== null && "code" in e && "args" in e) {
    const thrown = e as Diagnostic;
    return { ...thrown, stage: thrown.stage ?? Stage.SEMANTIC };
  }
  return diagnostic(
    DiagnosticCode.Error.UNEXPECTED,
    { message: e instanceof Error ? e.message : String(e) },
    undefined,
    Stage.SEMANTIC,
  );
}

export function makeParser<ResultType>(
  grammar: Grammar,
  semantics: Semantics,
  property: (obj: Dict) => ResultType = ({ root }) => root,
): (source: string) => Result<ResultType, Diagnostic> {
  return function parse(source) {
    const outer = failedActions;
    const failed: Diagnostic[] = [];
    failedActions = failed;
    try {
      const match = grammar.match(source);
      if (match.failed()) {
        return Err(
          syntaxDiagnostic(span(match.getInterval()), match.getExpectedText()),
        );
      }
      const parsed = semantics(match);
      const parse = property(parsed);
      return failed.length > 0 ? Err(failed[0]) : Ok(parse);
    } catch (e) {
      return Err(thrownDiagnostic(e));
    } finally {
      failedActions = outer;
    }
  };
}

export function span(span: Interval): Span {
  return {
    start: span.startIdx,
    end: span.endIdx,
    line: span.getLineAndColumn().lineNum,
  };
}
