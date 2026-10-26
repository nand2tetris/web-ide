import { grammar as ohmGrammar } from "ohm-js";
import {
  baseSemantics,
  grammars,
  isFail,
  makeParsers,
  type ParseError,
  parseErrorOf,
} from "./base.js";

export type Cell = string;
export type Line = Cell[];
/** `E` widens the lines at the recovery point; `never` is the strict type. */
export type Cmp<E = never> = (Line | E)[];

/** A Cmp where recovery may have replaced lines with error nodes. */
export type CmpPartial = Cmp<ParseError>;

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

cmpSemantics.addAttribute<Line | ParseError>("line", {
  line(body, end) {
    return isFail(end) ? parseErrorOf(end) : body.cells;
  },
});

cmpSemantics.addAttribute<CmpPartial>("root", {
  Root(lines) {
    return lines.children.map((c) => c.line);
  },
});

export const CMP = {
  grammar: cmpGrammar,
  semantics: cmpSemantics,
  parser: grammar,
  ...makeParsers<CmpPartial>(grammar, cmpSemantics),
};
