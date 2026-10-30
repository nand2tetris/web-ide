import { Err, unwrap } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  baseSemantics,
  type Diagnostic,
  describeEnglish,
  diagnostic,
  grammars,
  makeParser,
  span,
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

describe("makeParser", () => {
  const numbers = grammar(`Nums <: Base { Root := Number+ }`, grammars);
  const semantics = numbers.extendSemantics(baseSemantics);
  semantics.addAttribute<number[]>("root", {
    Root(nums) {
      return nums.children.map((n) => n.value);
    },
  });
  const parse = makeParser<number[]>(numbers, semantics);

  it("parses valid source", () => {
    expect(unwrap(parse("1 2 3"))).toEqual([1, 2, 3]);
  });

  it("describes a syntax error by code and expectations", () => {
    const result = parse("1 x");

    expect(result).toBeErr();
    const found = Err(result as Err<Diagnostic>);
    expect(found).toMatchObject({
      code: "syntax.expected",
      span: { line: 1 },
      stage: "parse",
    });
    expect(found).not.toHaveProperty("message");
    expect(describeEnglish(found)).toMatch(/^Line 1: expected /);
  });

  it("tags a failure inside a begun token as lex", () => {
    expect(Err(parse("1 %XZ"))).toEqual({
      code: "syntax.expected",
      args: { expected: ["a hexadecimal digit"] },
      span: { start: 4, end: 4, line: 1 },
      stage: "lex",
    });
  });

  it("keeps a diagnostic thrown by a semantic action", () => {
    const throwing = numbers.extendSemantics(baseSemantics);
    throwing.addAttribute<number[]>("root", {
      Root(_nums) {
        throw diagnostic(
          "asm.duplicateLabel",
          { label: "A" },
          span(this.source),
        );
      },
    });

    expect(Err(makeParser<number[]>(numbers, throwing)("1"))).toEqual({
      code: "asm.duplicateLabel",
      args: { label: "A" },
      span: { start: 0, end: 1, line: 1 },
      stage: "semantic",
    });
  });

  it("reports any other thrown error as an unexpected one", () => {
    const throwing = numbers.extendSemantics(baseSemantics);
    throwing.addAttribute<number[]>("root", {
      Root(_nums) {
        throw new Error("boom");
      },
    });

    expect(Err(makeParser<number[]>(numbers, throwing)("1"))).toEqual({
      code: "error.unexpected",
      args: { message: "boom" },
      stage: "semantic",
    });
  });
});
