import { describe, expect, it } from "vitest";
import { isRecovered } from "./base.js";
import { CMP, cmpSemantics, grammar, rawCMP } from "./cmp.js";

describe("cmp language", () => {
  it("parses an empty file", () => {
    const match = grammar.match("");
    expect(match).toHaveSucceeded();
    expect(cmpSemantics(match).root).toEqual([]);
  });

  it("parses a file into lines", () => {
    const match = grammar.match(`| a | b | out |
| 0 | 0 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 1 | 0 |`);

    expect(match).toHaveSucceeded();
    expect(cmpSemantics(match).root).toEqual([
      [" a ", " b ", " out "],
      [" 0 ", " 0 ", " 0 "],
      [" 1 ", " 0 ", " 1 "],
      [" 0 ", " 1 ", " 1 "],
      [" 1 ", " 1 ", " 0 "],
    ]);
  });
});

describe("CMP.parse, the final call", () => {
  /** A table whose third row is no row at all. */
  const BROKEN = "|  in  | out |\n|   0  |   1 |\nxyz\n";

  it.each([
    ["omitted", undefined, false],
    ["true", true, false],
    ["false", false, true],
  ])(
    "takes recovery %s as its option says",
    (_name, attemptRecovery, nullRoot) => {
      const outcome = CMP.parse(BROKEN, { attemptRecovery });

      expect(outcome.diagnostics).toHaveLength(1);
      expect("nullRoot" in outcome && outcome.nullRoot === true).toBe(nullRoot);
    },
  );

  it("keeps the recovered rows beside the diagnostic", () => {
    const outcome = CMP.parse(BROKEN);

    expect(outcome.ast.slice(0, 2)).toEqual([
      ["  in  ", " out "],
      ["   0  ", "   1 "],
    ]);
    expect(outcome.ast.filter(isRecovered)).toHaveLength(1);
  });

  it("leaves the raw parser's recovery off by default", () => {
    const outcome = rawCMP.parse(BROKEN);

    expect("nullRoot" in outcome && outcome.nullRoot).toBe(true);
    expect(outcome.ast).toEqual([]);
  });
});
