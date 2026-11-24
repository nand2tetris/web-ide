import { Err, Ok } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  baseSemantics,
  createError,
  grammars,
  isValid,
  makeParser,
  validOf,
} from "./base.js";

describe("Ohm Base", () => {
  it("parses numbers", () => {
    const match = grammars.Base.match("1234", "Number");

    expect(match).toHaveSucceeded();
    const { value } = baseSemantics(match);
    expect(value).toBe(1234);
  });

  it.each([
    ["%XFF", 255],
    ["%D128", 128],
    ["127", 127],
    ["%B11", 3],
    ["%D-1", 0xffff],
    ["0", 0],
    ["11111", 11111],
  ])("parses values", (str, num) => {
    const match = grammars.Base.match(str, "Number");
    expect(match).toHaveSucceeded();
    expect(baseSemantics(match).value).toBe(num);
  });

  it("saves names", () => {
    const match = grammars.Base.match("inout", "Name");
    expect(match).toHaveSucceeded();
    const { name } = baseSemantics(match);
    expect(name).toBe("inout");
  });

  describe("trailing lists", () => {
    const state = cleanState(() => {
      const repGrammar = grammar(
        `Rep <: Base {
          Rep = List<"A", ",">
          Block = OpenParen Rep CloseParen
        }`,
        grammars,
      );
      return { repGrammar };
    }, beforeEach);

    it.each([
      ["A,", "Rep"],
      ["(A,)", "Block"],
    ])("allows trailing lists", (str, tag) => {
      expect(state.repGrammar.match(str, tag)).toHaveSucceeded();
    });
  });
});

describe("parse outcomes", () => {
  const numbers = grammar(`Nums <: Base { Root := Number+ }`, grammars);
  function parser() {
    const semantics = numbers.extendSemantics(baseSemantics);
    semantics.addAttribute<number[]>("root", {
      Root(nums) {
        return nums.children.map((n) => n.value);
      },
    });
    return makeParser<number[]>(numbers, semantics, () => []);
  }
  it("returns a valid tree for valid source", () => {
    const result = parser().parse("1 2 3");
    expect(isValid(result)).toBe(true);
    expect(Ok(validOf(result))).toEqual([1, 2, 3]);
  });
  it("returns its null root and located message for invalid source", () => {
    const result = parser().parse("1 x");
    expect(result.ast).toEqual([]);
    expect(isValid(result)).toBe(false);
    expect(result.diagnostics[0]).toMatchObject({
      message: expect.stringMatching(/^Line 1:/),
      span: { line: 1 },
    });
    expect(Err(validOf(result))).toBe(result.diagnostics);
  });
  it("keeps every diagnostic in order when taking the Result view", () => {
    const diagnostics = [{ message: "first" }, { message: "second" }] as const;
    const result = { ast: [1], diagnostics };
    expect(isValid(result)).toBe(false);
    expect(Err(validOf(result))).toBe(diagnostics);
  });
  it("keeps a diagnostic thrown by a semantic action", () => {
    const failure = createError("bad number", { start: 0, end: 1, line: 1 });
    const semantics = numbers.extendSemantics(baseSemantics);
    semantics.addAttribute<number[]>("root", {
      Root(_nums) {
        throw failure;
      },
    });
    const result = makeParser<number[]>(numbers, semantics, () => []).parse(
      "1",
    );
    expect(result.ast).toEqual([]);
    expect(result.diagnostics).toEqual([failure]);
  });
  it("keeps the message of an unexpected semantic error", () => {
    const semantics = numbers.extendSemantics(baseSemantics);
    semantics.addAttribute<number[]>("root", {
      Root(_nums) {
        throw new Error("boom");
      },
    });
    const result = makeParser<number[]>(numbers, semantics, () => []).parse(
      "1",
    );
    expect(result.ast).toEqual([]);
    expect(result.diagnostics[0]?.message).toBe("boom");
  });
});
