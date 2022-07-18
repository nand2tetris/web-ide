import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result";
import ohm from "ohm-js";
import raw from "raw.macro";
import { grammars, UNKNOWN_PARSE_ERROR, baseSemantics } from "./base-ohm";

export type Cell = string;
export type Line = Cell[];
export type Cmp = Line[];

export const cmpGrammar = raw("./grammars/cmp.ohm");
// console.log(cmpGrammar);
export const grammar = ohm.grammar(cmpGrammar, grammars);
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

cmpSemantics.addAttribute<Cmp>("lines", {
  Root(lines) {
    return lines.children.map((c) => c.line);
  },
});

export const CMP = {
  grammar: cmpGrammar,
  semantics: cmpSemantics,
  parse(
    source: string
  ): Result<Cmp, Error | { message: string; shortMessage: string }> {
    try {
      const match = grammar.match(source);
      if (match.succeeded()) {
        const semantics = cmpSemantics(match);
        const parse = semantics.lines;
        return Ok(parse);
      } else {
        return Err({
          message: match.message ?? UNKNOWN_PARSE_ERROR,
          shortMessage: match.shortMessage ?? UNKNOWN_PARSE_ERROR,
        });
      }
    } catch (e) {
      return Err(e as Error);
    }
  },
};
