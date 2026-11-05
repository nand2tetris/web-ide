import { grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  carrierOf,
  grammars,
  guardedRecovery,
  makeParser,
  type Outcome,
  type Parser,
  type Recovery,
  type RecoveryPoint,
} from "./base.js";

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

cmpSemantics.addAttribute<Cmp>("root", {
  Root(lines) {
    return lines.children.map((c) => c.line);
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
  /** Default false. */
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
