import { Ok } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { cmpParser } from "./cmp.js";

describe("cmp language", () => {
  it("parses a file into lines", () => {
    const parser = cmpParser;
    const parsed = parser(`| a | b | out |
| 0 | 0 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 1 | 0 |`);

    expect(parsed).toEqual(
      Ok([
        "",
        [
          "| a | b | out |",
          "| 0 | 0 | 0 |",
          "| 1 | 0 | 1 |",
          "| 0 | 1 | 1 |",
          "| 1 | 1 | 0 |",
        ],
      ])
    );
  });
});
