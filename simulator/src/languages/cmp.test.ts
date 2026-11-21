import { describe, expect, it } from "vitest";
import { isRecovered, makePrune } from "./base.js";
import { CMP, type Cmp, cmpSemantics, grammar, rawCMP } from "./cmp.js";
import { describeDiagnostic } from "./diagnostic.js";

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

describe("CMP row widths", () => {
  it("accepts rows as wide as or narrower than the header", () => {
    expect(CMP.parse("| a | b |\n| 0 | 1 |\n| 0 |").diagnostics).toEqual([]);
  });

  it("rejects each wider row and keeps the others", () => {
    const outcome = CMP.parse("| a |\n| 0 | 1 |\n| 1 |\n| 1 | 0 | 0 |");

    expect(outcome.diagnostics).toMatchObject([
      { code: "cmp.rowWidth", args: { row: 2, header: 1 }, span: { line: 2 } },
      { code: "cmp.rowWidth", args: { row: 3, header: 1 }, span: { line: 4 } },
    ]);
    expect(outcome.ast.filter(isRecovered)).toHaveLength(2);
  });

  it("names both widths when a row is wider than its header", () => {
    const source = [
      "| a | b |out|",
      "| 0 | 0 | 0 |",
      "| 0 | 1 | 0 | 7 |",
      "| 1 | 0 | 0 |",
      "| 1 | 1 | 1 |",
    ].join("\n");

    expect(
      CMP.parse(source).diagnostics.map((d) => describeDiagnostic(d)),
    ).toEqual(["Line 3: The row has 4 columns, but the header has 3"]);
  });
});
