import { grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  grammars,
  guardedRecovery,
  makeParser,
  type Recovery,
  type RecoveryPoint,
} from "./base.js";

export type Cell = string;
/** A row of cells. A recovered row is a null line (see `isRecovered`). */
export type Line = Cell[] & Recovery;
export type Cmp = Line[];

/** The null line where recovery skipped a row: no cells, and its diagnostic. */
function nullLine({ recovery }: RecoveryPoint): Line {
  return Object.assign([], { recovery });
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
  line(body, correction, _end) {
    const recovered: RecoveryPoint | undefined = guardedRecovery(
      body,
      correction,
    );
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

export const CMP = {
  grammar: cmpGrammar,
  semantics: cmpSemantics,
  parser: grammar,
  ...makeParser<Cmp>(grammar, cmpSemantics, emptyCmp),
};
