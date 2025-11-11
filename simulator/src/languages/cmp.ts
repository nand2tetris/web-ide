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

export const CMP = {
  grammar: cmpGrammar,
  semantics: cmpSemantics,
  parser: grammar,
  parse: makeParser<Cmp>(grammar, cmpSemantics),
};
