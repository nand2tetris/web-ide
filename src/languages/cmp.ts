/** Reads and parses a .cmp file, to compare lines of output between test runs. */

import { Parser } from "./parser/base.js";
import { tag, take_until } from "./parser/bytes.js";
import { map, mapParser } from "./parser/combinator.js";
import { many0, many1 } from "./parser/multi.js";
import { line } from "./parser/recipe.js";
import { preceded, terminated } from "./parser/sequence.js";

export const cmpParser: Parser<string[][]> = many0(
  mapParser(
    line(),
    terminated(
      many1(
        preceded(
          tag("|"),
          map(take_until(tag("|")), (s) => s.toString())
        )
      ),
      tag("|")
    )
  )
);
