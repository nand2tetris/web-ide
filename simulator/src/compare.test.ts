import { describe, expect, it } from "vitest";
import { compare, compareLines, diff } from "./compare.js";

describe("compare", () => {
  it("diffs a row", () => {
    const as = ["a", "b", "c"];
    const bs = ["a", "d", "c"];
    const diffs = diff(as, bs);
    expect(diffs).toMatchObject([{ a: "b", b: "d", col: 1 }]);
  });

  it("diffs a block", () => {
    const as = [
      ["0", "0", "0"],
      ["0", "1", "1"],
      ["1", "0", "1"],
      ["1", "1", "0"],
    ];
    const bs = [
      ["0", "0", "0"],
      ["0", "1", "0"],
      ["1", "0", "0"],
      ["1", "1", "1"],
    ];
    const diffs = compare(as, bs);
    expect(diffs).toMatchObject([
      { a: "1", b: "0", row: 1, col: 2 },
      { a: "1", b: "0", row: 2, col: 2 },
      { a: "0", b: "1", row: 3, col: 2 },
    ]);
  });
});

describe("compareLines", () => {
  it("handles windows and unix lines", () => {
    expect(compareLines("AAA\r\nBBB\r\nCCC\r\n", "AAA\nBBB\nCCC\n")).toEqual(
      {},
    );
    expect(compareLines("AAA\nBBB\nCCC\n", "AAA\r\nBBB\r\nCCC\r\n")).toEqual(
      {},
    );
  });
});

describe("compareLines trailing blank lines (#678)", () => {
  const hack = "0000000000000001\n1110110000010000";

  it("ignores a trailing newline on either side", () => {
    expect(compareLines(hack, `${hack}\n`)).toEqual({});
    expect(compareLines(`${hack}\n`, hack)).toEqual({});
    expect(compareLines(`${hack}\n`, `${hack}\n`)).toEqual({});
  });

  it("ignores trailing whitespace-only lines", () => {
    expect(compareLines(hack, `${hack}\n \r\n\n`)).toEqual({});
  });

  it("still reports genuinely different lengths", () => {
    expect(compareLines("a\nb", "a\nb\nc")).toEqual({ lenA: 2, lenB: 3 });
  });

  it("still reports a differing line, including an interior blank line", () => {
    expect(compareLines("a\nb\nc", "a\nx\nc")).toEqual({ line: 1 });
    expect(compareLines("a\n\nc", "a\nc\n")).toEqual({ lenA: 3, lenB: 2 });
  });
});
