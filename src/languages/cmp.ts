/** Reads and parses a .cmp file, to compare lines of output between test runs. */

import { Parser } from "./parser/base";
import { tag, take_until } from "./parser/bytes";
import { map, mapParser } from "./parser/combinator";
import { many0, many1 } from "./parser/multi";
import { line } from "./parser/recipe";
import { preceded, terminated } from "./parser/sequence";

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
