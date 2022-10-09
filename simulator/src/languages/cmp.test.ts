import { cmpSemantics, grammar } from "./cmp.js";

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
