import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { cmpParser } from "../languages/cmp";
import { compare, diff } from "./compare";

const a = `| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |`;
const b = `| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |`;

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

  it("diffs parsed strings", () => {
    const as = unwrap(cmpParser(a))[1];
    const bs = unwrap(cmpParser(b))[1];

    const diffs = compare(as, bs);

    expect(diffs).toMatchObject([
      { a: " 1 ", b: " 0 ", row: 1, col: 2 },
      { a: " 1 ", b: " 0 ", row: 2, col: 2 },
      { a: " 0 ", b: " 1 ", row: 3, col: 2 },
    ]);
  });
});
