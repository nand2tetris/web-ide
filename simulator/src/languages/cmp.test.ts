import { describe, expect, it } from "vitest";
import { isRecovered, makePrune } from "./base.js";
import { CMP, type Cmp, cmpSemantics, grammar, rawCMP } from "./cmp.js";

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

const BROKEN = "|  in  | out |\n|   0  |   1 |\nxyz\n";

describe("CMP.parse, the final call", () => {
  it("is strict by default and retains damaged rows only when recovery is enabled", () => {
    const strict = CMP.parse(BROKEN);
    expect(strict).toEqual(CMP.parse(BROKEN, { attemptRecovery: false }));
    expect(strict).toHaveProperty("nullRoot", true);
    expect(strict.ast).toEqual([]);
    const outcome = CMP.parse(BROKEN, { attemptRecovery: true });
    expect(outcome.diagnostics).toHaveLength(1);
    expect(outcome).not.toHaveProperty("nullRoot");
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

describe("makePrune", () => {
  it("rejects tables whose pruning callback leaves a recovered row", () => {
    const outcome = CMP.parse(BROKEN, { attemptRecovery: true });
    const rows = outcome.ast.filter(isRecovered);
    const prune = makePrune<Cmp>((table) => table);

    expect("nullRoot" in outcome && outcome.nullRoot).toBe(false);
    expect(rows).toHaveLength(1);
    expect(Array.isArray(rows[0])).toBe(true);
    expect(rows[0].recovery).toBe(outcome.diagnostics[0]);
    expect(() => prune(outcome.ast)).toThrow(
      "prune left a recovered node outside a list",
    );

    const dropRecoveredRows = makePrune<Cmp>((table) =>
      table.filter((row) => !isRecovered(row)),
    );
    expect(dropRecoveredRows(outcome.ast)).toEqual(outcome.ast.slice(0, 2));
    expect(dropRecoveredRows.provenance(outcome.ast)[0].diagnostic).toBe(
      outcome.diagnostics[0],
    );
  });
});
