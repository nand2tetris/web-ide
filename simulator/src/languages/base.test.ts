import { Err, Ok } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  baseSemantics,
  type Diagnostics,
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

  describe("partial parse result", () => {
    const listGrammar = grammar(`Nums <: Base { Root := Number+ }`, grammars);
    const numsSemantics = listGrammar.extendSemantics(baseSemantics);
    numsSemantics.addAttribute<number[]>("root", {
      Root(nums) {
        return nums.children.map((n) => n.value);
      },
    });
    const { parse, empty } = makeParser<number[]>(
      listGrammar,
      numsSemantics,
      () => [],
    );

    it("returns a valid outcome for valid source", () => {
      const outcome = parse("1 2 3");
      expect(outcome).toEqual({ ast: [1, 2, 3], diagnostics: [] });
      expect(isValid(outcome)).toBe(true);
    });

    it("returns the null root and today's message for invalid source", () => {
      const outcome = parse("1 x");
      if (isValid(outcome)) throw new Error("parse is valid");
      expect(outcome.ast).toEqual([]);
      expect(outcome.ast).toEqual(empty());
      expect(outcome.diagnostics).toHaveLength(1);
      expect(outcome.diagnostics[0].message).toMatch(/^Line 1: expected /);
      expect(outcome.diagnostics[0]).not.toHaveProperty("errors");
    });

    it("validOf returns the AST for valid source", () => {
      expect(Ok(validOf(parse("1 2 3")))).toEqual([1, 2, 3]);
    });

    it("validOf rejects invalid source with every diagnostic", () => {
      const outcome = parse("1 x");
      const result = validOf(outcome);
      expect(result).toBeErr();
      expect(Err(result as Err<Diagnostics>)).toBe(outcome.diagnostics);
    });

    it("validOf rejects a tree with diagnostics, keeping their order", () => {
      const first = { message: "Line 2: first" };
      const second = { message: "Line 3: second" };
      const outcome = {
        ast: [1],
        diagnostics: [first, second],
      } as const;
      expect(isValid(outcome)).toBe(false);
      expect(validOf(outcome)).toBeErr();
      expect(Err(validOf(outcome))).toEqual([first, second]);
    });

    it("tells an unparsed file from an empty valid file by its diagnostics", () => {
      const optional = grammar(`Opt <: Base { Root := Number* }`, grammars);
      const optSemantics = optional.extendSemantics(baseSemantics);
      optSemantics.addAttribute<number[]>("root", {
        Root(nums) {
          return nums.children.map((n) => n.value);
        },
      });
      const opt = makeParser<number[]>(optional, optSemantics, () => []);
      const emptyFile = opt.parse("");
      const unparsed = opt.parse("x");
      expect(emptyFile.ast).toEqual(unparsed.ast);
      expect(emptyFile.diagnostics).toEqual([]);
      expect(isValid(emptyFile)).toBe(true);
      expect(unparsed.diagnostics).not.toHaveLength(0);
      expect(isValid(unparsed)).toBe(false);
    });
  });
});
