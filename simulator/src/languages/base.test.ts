import { Err, Ok } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  baseSemantics,
  type Diagnostics,
  grammars,
  isParserRecoveryEnabled,
  isRecovered,
  isValid,
  makeParser,
  type Recovery,
  type RecoveryPoint,
  recoveryOf,
  setParserRecovery,
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
    beforeEach(() => setParserRecovery(false));
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

    it("isRecovered and recoveryOf read a hand built null object", () => {
      const recovery = { message: "Line 1: bad" };
      const broken: Recovery = { recovery };
      const clean: Recovery = {};
      expect(isRecovered(broken)).toBe(true);
      expect(recoveryOf(broken)).toBe(recovery);
      expect(isRecovered(clean)).toBe(false);
      expect(recoveryOf(clean)).toBeUndefined();
    });
  });
});
describe("parser recovery opt-in", () => {
  it("starts disabled and can be reset after opting in", () => {
    expect(isParserRecoveryEnabled()).toBe(false);
    setParserRecovery(true);
    expect(isParserRecoveryEnabled()).toBe(true);
    setParserRecovery(false);
    expect(isParserRecoveryEnabled()).toBe(false);
  });
});

describe("recovering parser factory", () => {
  const recoveringGrammar = grammar(
    `Words { Root = (word ! ";")+ word = letter+ }`,
  );
  const semantics = recoveringGrammar.createSemantics();
  semantics.addAttribute<string>("root", {
    Root(_words, _ends) {
      return "partial AST";
    },
  });
  const parser = makeParser<string>(
    recoveringGrammar,
    semantics,
    () => "null root",
  );

  beforeEach(() => setParserRecovery(false));
  afterEach(() => setParserRecovery(false));

  it("keeps recovery disabled until opted in", () => {
    const strict = parser.parse("1;2;");
    expect(strict.ast).toBe("null root");
    expect(strict.diagnostics).toHaveLength(1);
    setParserRecovery(true);
    const outcome = parser.parse("1;2;");
    expect(outcome.ast).toBe("partial AST");
    expect(outcome.diagnostics).toHaveLength(2);
  });

  it("validOf rejects a recovered AST and the outcome retains every diagnostic", () => {
    setParserRecovery(true);
    const recovered = parser.parse("1;2;");
    expect(isValid(recovered)).toBe(false);
    expect(recovered.ast).toBe("partial AST");
    const result = validOf(recovered);
    expect(result).toBeErr();
    expect(Err(result as Err<Diagnostics>)).toBe(recovered.diagnostics);
  });

  it("rethrows Ohm's missing `_fail` action", () => {
    const visiting = recoveringGrammar.createSemantics();
    visiting.addAttribute<string[]>("root", {
      Root(_words, ends) {
        return ends.children.map((end) => end.text);
      },
    });
    visiting.addAttribute<string>("text", {
      _terminal() {
        return this.sourceString;
      },
    });
    const unhandled = makeParser<string[]>(
      recoveringGrammar,
      visiting,
      () => [],
    );
    expect(isValid(unhandled.parse("a;b;"))).toBe(true);
    setParserRecovery(true);
    expect(() => unhandled.parse("a 1;b;")).toThrow(
      /Missing semantic action for _fail/,
    );
  });

  it("keeps syntax diagnostics ahead of an AST conversion error", () => {
    const conversionError = new Error("AST conversion failed");
    const throwing = recoveringGrammar.createSemantics();
    throwing.addAttribute<string>("root", {
      Root(_words, _ends) {
        throw conversionError;
      },
    });
    const failing = makeParser<string>(
      recoveringGrammar,
      throwing,
      () => "null root",
    );
    setParserRecovery(true);
    const outcome = failing.parse("1;2;");
    expect(isValid(outcome)).toBe(false);
    expect(outcome.ast).toBe("null root");
    expect(outcome.diagnostics).toHaveLength(3);
    expect(outcome.diagnostics.slice(0, 2)).toEqual(
      parser.parse("1;2;").diagnostics,
    );
    expect(outcome.diagnostics[2]).toBe(conversionError);
  });
});

describe("the recovery attribute", () => {
  const blocks = grammar(
    `Blocks <: Base {
      Root := Block
      Block = "{" Item* ! "}"
      Item = Block | Stmt
      Stmt = Body ! ";"
      Body = letter+
    }`,
    grammars,
  );
  const semantics = blocks.extendSemantics(baseSemantics);
  /** Each statement's body and end slots, then each block's closer slot. */
  semantics.addAttribute<(RecoveryPoint | undefined)[]>("slots", {
    Root(block) {
      return block.slots;
    },
    Block(_open, items, close) {
      return [...items.children.flatMap((item) => item.slots), close.recovery];
    },
    Item(item) {
      return item.slots;
    },
    Stmt(body, end) {
      return [body.recovery, end.recovery];
    },
  });
  semantics.addAttribute("root", {
    Root(_) {
      return this.slots;
    },
  });
  const parser = makeParser<(RecoveryPoint | undefined)[]>(
    blocks,
    semantics,
    () => [],
  );

  beforeEach(() => setParserRecovery(true));
  afterEach(() => setParserRecovery(false));

  it("is undefined everywhere in a valid parse", () => {
    const outcome = parser.parse("{ a; { b; } }");
    expect(outcome).toEqual({
      ast: [undefined, undefined, undefined, undefined, undefined, undefined],
      diagnostics: [],
    });
  });

  it("is undefined for an empty placeholder and links a recovery to its diagnostic", () => {
    const outcome = parser.parse("{ a 1; c; }");
    expect(outcome.ast).toHaveLength(5);
    expect(outcome.diagnostics).toHaveLength(1);
    const [body, end, ...rest] = outcome.ast;
    expect(body).toBeUndefined();
    expect(end?.recovery).toBe(outcome.diagnostics[0]);
    expect(end?.span).toMatchObject({ start: 2, end: 5 });
    expect(rest).toEqual([undefined, undefined, undefined]);
  });

  it("links equal failures that Ohm listed once to the one diagnostic", () => {
    // Both blocks lack `}` at the end of input. Ohm lists the failure once and
    // each `_fail` node holds its own copy.
    const outcome = parser.parse("{ a; { b;");
    expect(outcome.ast).not.toHaveLength(0);
    expect(outcome.diagnostics).toHaveLength(1);
    const closers = outcome.ast.filter((slot) => slot !== undefined);
    expect(closers).toHaveLength(2);
    for (const closer of closers) {
      expect(closer.recovery).toBe(outcome.diagnostics[0]);
    }
  });

  it("is never read with recovery off", () => {
    setParserRecovery(false);
    const outcome = parser.parse("{ a 1; c; }");
    expect(isValid(outcome)).toBe(false);
    expect(outcome.ast).toEqual([]);
  });
});
