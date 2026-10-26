import { Err, Ok } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  baseSemantics,
  type CompilationError,
  grammars,
  isParseError,
  makeParsers,
  type ParseError,
  requireValid,
  setParserRecovery,
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

  describe("partial parse result", () => {
    const listGrammar = grammar(`Nums <: Base { Root := Number+ }`, grammars);
    const numsSemantics = listGrammar.extendSemantics(baseSemantics);
    numsSemantics.addAttribute<number[]>("root", {
      Root(nums) {
        return nums.children.map((n) => n.value);
      },
    });
    const { parse } = makeParsers<number[]>(listGrammar, numsSemantics);

    beforeEach(() => setParserRecovery(false));

    it("returns Ok with an empty error list for valid source", () => {
      const result = parse("1 2 3");
      expect(result).toBeOk();
      expect(Ok(result)).toEqual({ ast: [1, 2, 3], errors: [] });
    });

    it("returns Err with today's message for invalid source", () => {
      const result = parse("1 x");
      expect(result).toBeErr();
      expect(Err(result as Err<CompilationError>).message).toMatch(
        /^Line 1: expected /,
      );
      expect(Err(result as Err<CompilationError>).errors).toBeUndefined();
    });

    it("requireValid returns the strict AST when there are no errors", () => {
      const strict = requireValid({ ast: [1], errors: [] });
      expect(strict).toBeOk();
      expect(Ok(strict)).toEqual([1]);
    });

    it("requireValid returns the first error when there are errors", () => {
      const first = { message: "Line 2: first" };
      const second = { message: "Line 3: second" };
      const strict = requireValid({ ast: [1], errors: [first, second] });
      expect(strict).toBeErr();
      expect(Err(strict)).toEqual(first);
    });

    it("isParseError recognizes a hand built error node", () => {
      const node: ParseError = {
        kind: "ParseError",
        error: { message: "Line 1: bad" },
        span: { start: 0, end: 1, line: 1 },
      };
      expect(isParseError(node)).toBe(true);
      expect(isParseError({ kind: "Part" })).toBe(false);
      expect(isParseError(undefined)).toBe(false);
      expect(isParseError("ParseError")).toBe(false);
    });
  });
});
