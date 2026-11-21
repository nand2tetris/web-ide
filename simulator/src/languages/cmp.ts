import { grammar as ohmGrammar } from "ohm-js";
import {
  actionError,
  baseSemantics,
  carrierOf,
  failedOf,
  grammars,
  guardedRecovery,
  isRecovered,
  makeParser,
  type Outcome,
  type Parser,
  type Recovery,
  type RecoveryPoint,
  span,
} from "./base.js";
import { DiagnosticCode } from "./diagnostic.js";

export type Cell = string;
export type Line = Cell[] & Recovery;
export type Cmp = Line[];

function nullLine(point: RecoveryPoint): Line {
  return Object.assign([], carrierOf(point, "line"));
}

import cmpGrammar from "./grammars/cmp.ohm.js";
export const grammar = ohmGrammar(cmpGrammar, grammars);
export const cmpSemantics = grammar.extendSemantics(baseSemantics);

cmpSemantics.addAttribute<Cell>("cell", {
  cell(value, _) {
    return value.sourceString;
  },
});

cmpSemantics.addAttribute<Line>("line", {
  line(bar, cells, correction, _end) {
    const recovered = guardedRecovery(bar, correction);
    return recovered ? nullLine(recovered) : cells.children.map((c) => c.cell);
  },
});

/**
 * A row wider than the first row, the header, is an error; a narrower one is
 * not. A damaged header disables the check.
 */
cmpSemantics.addAttribute<Cmp>("root", {
  Root(lines) {
    const rows: Cmp = lines.children.map((c) => c.line);
    const [header] = rows;
    if (header === undefined || isRecovered(header)) return rows;
    return rows.map((row, i) => {
      if (isRecovered(row) || row.length <= header.length) return row;
      const at = span(lines.children[i].source);
      const wide = actionError(
        DiagnosticCode.Cmp.ROW_WIDTH,
        { row: row.length, header: header.length },
        at,
      );
      return Object.assign(row, failedOf(wide, at, "rowWidth"));
    });
  },
});

function emptyCmp(): Cmp {
  return [];
}

export const rawCMP: Parser<Cmp> = makeParser<Cmp>(
  grammar,
  cmpSemantics,
  emptyCmp,
);

export interface CmpParseOptions {
  /** See `ParseOptions.attemptRecovery`. */
  attemptRecovery?: boolean;
}

export const CMP = {
  grammar: cmpGrammar,
  semantics: cmpSemantics,
  parser: grammar,
  empty: emptyCmp,
  parse(source: string, options: CmpParseOptions = {}): Outcome<Cmp> {
    return rawCMP.parse(source, {
      attemptRecovery: options.attemptRecovery ?? false,
    });
  },
};
