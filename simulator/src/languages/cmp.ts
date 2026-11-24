import { grammar as ohmGrammar } from "ohm-js";
import { baseSemantics, grammars, makeParser } from "./base.js";

export type Cell = string;
export type Line = Cell[];
export type Cmp = Line[];

import cmpGrammar from "./grammars/cmp.ohm.js";
export const grammar = ohmGrammar(cmpGrammar, grammars);
export const cmpSemantics = grammar.extendSemantics(baseSemantics);

cmpSemantics.addAttribute<Cell>("cell", {
  cell(value, _) {
    return value.sourceString;
  },
});

cmpSemantics.addAttribute<Line>("line", {
  line(_a, cells, _b) {
    return cells.children.map((c) => c.cell);
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
