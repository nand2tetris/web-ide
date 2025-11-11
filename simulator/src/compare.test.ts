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
