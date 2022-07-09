import { Ok } from "@davidsouther/jiffies/lib/esm/result";
import { cmpParser } from "./cmp";

describe("cmp language", () => {
  it("parses a file into lines", () => {
    const parser = cmpParser;
    const parsed = parser(`| a | b | out |
| 0 | 0 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 1 | 0 |`);

    expect(parsed).toBeOk(
      Ok([
        "",
        [
          [" a ", " b ", " out "],
          [" 0 ", " 0 ", " 0 "],
          [" 1 ", " 0 ", " 1 "],
          [" 0 ", " 1 ", " 1 "],
          [" 1 ", " 1 ", " 0 "],
        ],
      ])
    );
  });
});
