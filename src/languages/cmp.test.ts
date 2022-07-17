import { cmpSemantics, grammar } from "./cmp";

describe("cmp language", () => {
  it("parses a file into lines", () => {
    const match = grammar.match(`| a | b | out |
| 0 | 0 | 0 |
| 1 | 0 | 1 |
| 0 | 1 | 1 |
| 1 | 1 | 0 |`);

    expect(match).toHaveSucceeded();
    expect(cmpSemantics(match).lines).toEqual([
      [" a ", " b ", " out "],
      [" 0 ", " 0 ", " 0 "],
      [" 1 ", " 0 ", " 1 "],
      [" 0 ", " 1 ", " 1 "],
      [" 1 ", " 1 ", " 0 "],
    ]);
  });
});
