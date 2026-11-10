import { Err, Ok } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  actionError,
  baseSemantics,
  failedOf,
  grammars,
  isRecovered,
  isValid,
  makeParser,
  type Recovery,
  recoveryOf,
  span,
  validOf,
} from "./base.js";
import {
  type Diagnostic,
  DiagnosticCode,
  type Diagnostics,
  describeDiagnostic,
  diagnostic,
  type Span,
  Stage,
} from "./diagnostic.js";

/**
 * A diagnostic that only needs to be told apart from others: its argument is
 * a label.
 */
const named = (name: string, span?: Span, stage?: Stage): Diagnostic =>
  diagnostic(DiagnosticCode.Chip.NOT_FOUND, { name }, span, stage);

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
      expect(outcome.diagnostics[0]).toMatchObject({
        code: DiagnosticCode.Syntax.EXPECTED,
        span: { line: 1 },
        stage: Stage.PARSE,
      });
      expect(describeDiagnostic(outcome.diagnostics[0])).toMatch(
        /^Line 1: expected /,
      );
      expect(outcome.diagnostics[0]).not.toHaveProperty("message");
    });

    it("tags a failure inside a begun token as lex", () => {
      expect(parse("1 %XZ").diagnostics).toEqual([
        {
          code: DiagnosticCode.Syntax.EXPECTED,
          args: { expected: ["a hexadecimal digit"] },
          span: { start: 4, end: 4, line: 1 },
          stage: Stage.LEX,
        },
      ]);
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
      const first = named("first");
      const second = named("second");
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

describe("recovery helpers", () => {
  it("identify null objects and expose their diagnostics", () => {
    const recovery = named("bad");
    const broken: Recovery = { recovery };
    const clean: Recovery = {};
    expect(isRecovered(broken)).toBe(true);
    expect(recoveryOf(broken)).toBe(recovery);
    expect(isRecovered(clean)).toBe(false);
    expect(recoveryOf(clean)).toBeUndefined();
  });
});

describe("a semantic action that fails", () => {
  interface Digit extends Recovery {
    value: number;
  }
  const digits = grammar(
    `Digits <: Base { Root := (Number ! ";")* }`,
    grammars,
  );
  const semantics = digits.extendSemantics(baseSemantics);
  semantics.addAttribute<Digit>("digit", {
    Number(_) {
      const at = span(this.source);
      return this.value < 10
        ? { value: this.value }
        : {
            value: 0,
            ...failedOf(
              actionError(
                DiagnosticCode.Chip.NOT_FOUND,
                { name: `${this.value}` },
                at,
              ),
              at,
              "Number",
            ),
          };
    },
  });
  semantics.addAttribute<Digit[]>("root", {
    Root(numbers, _corrections, _ends) {
      return numbers.children.map((n) => n.digit);
    },
  });
  const parser = makeParser<Digit[]>(digits, semantics, () => []);

  it("keeps the tree, with a null object beside a semantic diagnostic", () => {
    const outcome = parser.parse("1; 23; 4;");

    expect(outcome).not.toHaveProperty("nullRoot");
    expect(outcome.diagnostics).toEqual([
      {
        code: DiagnosticCode.Chip.NOT_FOUND,
        args: { name: "23" },
        span: { start: 3, end: 5, line: 1 },
        stage: Stage.SEMANTIC,
      },
    ]);
    const [one, broken, four] = outcome.ast;
    expect([one.value, four.value]).toEqual([1, 4]);
    expect(recoveryOf(broken)).toBe(outcome.diagnostics[0]);
    expect(broken.skipped).toEqual({
      kind: "Number",
      interval: { start: 3, end: 5, line: 1 },
    });
  });

  it("keeps an action error when a later action throws", () => {
    const throwing = digits.extendSemantics(semantics);
    throwing.extendAttribute<Digit[]>("root", {
      Root(numbers, _corrections, _ends) {
        numbers.children.forEach((n) => n.digit);
        throw new Error("unexpected");
      },
    });
    const failing = makeParser<Digit[]>(digits, throwing, () => []);

    const outcome = failing.parse("23;");

    expect(outcome).toHaveProperty("nullRoot", true);
    expect(outcome.diagnostics).toMatchObject([
      {
        code: DiagnosticCode.Chip.NOT_FOUND,
        args: { name: "23" },
        stage: Stage.SEMANTIC,
      },
      {
        code: DiagnosticCode.Error.UNEXPECTED,
        args: { message: "unexpected" },
        stage: Stage.SEMANTIC,
      },
    ]);
  });
});
