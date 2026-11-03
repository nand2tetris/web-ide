import { grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  carrierOf,
  grammars,
  makeParser,
  type Outcome,
  type Parser,
  type Recovery,
  type RecoveryPoint,
} from "./base.js";

export type Cell = string;
/** A row of cells. A recovered row is a null line (see `isRecovered`). */
export type Line = Cell[] & Recovery;
export type Cmp = Line[];

/** The null line where recovery skipped a row: no cells, and its diagnostic. */
function nullLine(point: RecoveryPoint): Line {
  return Object.assign([], carrierOf(point, "lineBody"));
}

import cmpGrammar from "./grammars/cmp.ohm.js";
export const grammar = ohmGrammar(cmpGrammar, grammars);
export const cmpSemantics = grammar.extendSemantics(baseSemantics);

cmpSemantics.addAttribute<Cell>("cell", {
  cell(value, _) {
    return value.sourceString;
  },
});

cmpSemantics.addAttribute<Line>("cells", {
  lineBody(_bar, cells) {
    return cells.children.map((c) => c.cell);
  },
});

cmpSemantics.addAttribute<Line>("line", {
  line(body, end) {
    const recovered: RecoveryPoint | undefined = end.recovery;
    return recovered ? nullLine(recovered) : body.cells;
  },
});

cmpSemantics.addAttribute<Cmp>("root", {
  Root(lines) {
    return lines.children.map((c) => c.line);
  },
});

/** The null root of a parse that built no table: a table with no lines. */
function emptyCmp(): Cmp {
  return [];
}

/** The low-level CMP parser. Recovery is off unless a caller opts in. */
export const rawCMP: Parser<Cmp> = makeParser<Cmp>(
  grammar,
  cmpSemantics,
  emptyCmp,
);

/** Options of the CMP final call. */
export interface CmpParseOptions {
  /** Recover from syntax errors to keep reading rows. Default true. */
  attemptRecovery?: boolean;
}

/**
 * The CMP final call. `parse` reads a compare or output file with recovery on
 * by default, so its outcome keeps recovered rows beside every diagnostic; a
 * consumer that needs a usable table goes through `validOf`. `parser` stays
 * the Ohm grammar, for syntax highlighting.
 */
export const CMP = {
  grammar: cmpGrammar,
  semantics: cmpSemantics,
  parser: grammar,
  empty: emptyCmp,
  parse(source: string, options: CmpParseOptions = {}): Outcome<Cmp> {
    return rawCMP.parse(source, {
      attemptRecovery: options.attemptRecovery ?? true,
    });
  },
};
