import { Err, Ok } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  baseSemantics,
  type Diagnostic,
  type Diagnostics,
  describeEnglish,
  diagnostic,
  grammars,
  isParserRecoveryEnabled,
  isRecovered,
  isValid,
  makeParser,
  makePrune,
  type Recovery,
  type RecoveryPoint,
  recoveryOf,
  type Span,
  type Stage,
  setParserRecovery,
  span,
  validOf,
} from "./base.js";

/**
 * A diagnostic that only needs to be told apart from others: its argument is
 * a label.
 */
const named = (name: string, span?: Span, stage?: Stage): Diagnostic =>
  diagnostic("chip.notFound", { name }, span, stage);

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
      expect(outcome.diagnostics[0]).toMatchObject({
        code: "syntax.expected",
        span: { line: 1 },
        stage: "parse",
      });
      expect(describeEnglish(outcome.diagnostics[0])).toMatch(
        /^Line 1: expected /,
      );
      expect(outcome.diagnostics[0]).not.toHaveProperty("message");
    });

    it("tags a failure inside a begun token as lex", () => {
      expect(parse("1 %XZ").diagnostics).toEqual([
        {
          code: "syntax.expected",
          args: { expected: ["a hexadecimal digit"] },
          span: { start: 4, end: 4, line: 1 },
          stage: "lex",
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

    it("isRecovered and recoveryOf read a hand built null object", () => {
      const recovery = named("bad");
      const broken: Recovery = { recovery };
      const clean: Recovery = {};
      expect(isRecovered(broken)).toBe(true);
      expect(recoveryOf(broken)).toBe(recovery);
      expect(isRecovered(clean)).toBe(false);
      expect(recoveryOf(clean)).toBeUndefined();
    });
  });

  describe("prune", () => {
    interface Item extends Recovery {
      name: string;
    }
    interface Tree {
      items: Item[];
      last?: Item;
    }
    const recovery = named("bad");
    const tree: Tree = {
      items: [{ name: "a" }, { name: "", recovery }, { name: "b" }],
    };

    it("returns the tree with no recovered item", () => {
      const prune = makePrune<Tree>((t) => ({
        ...t,
        items: t.items.filter((item) => !isRecovered(item)),
      }));
      expect(prune(tree)).toEqual({ items: [{ name: "a" }, { name: "b" }] });
    });

    it("refuses a tree whose drop leaves a recovered node", () => {
      const prune = makePrune<Tree>((t) => ({
        items: [],
        last: t.items[1],
      }));
      expect(() => prune(tree)).toThrow(/recovered/);
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
    Root(_words, _corrections, _ends) {
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

  it("rethrows Ohm's missing `_correction` action", () => {
    const visiting = recoveringGrammar.createSemantics();
    visiting.addAttribute<string[]>("root", {
      Root(_words, corrections, _ends) {
        return corrections.children.map((correction) => correction.text);
      },
    });
    visiting.addAttribute<string>("text", {
      _terminal() {
        return this.sourceString;
      },
      _iter(...children) {
        return children.map((child) => child.text).join("");
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
      /Missing semantic action for _correction/,
    );
  });

  it("keeps syntax diagnostics ahead of an AST conversion error", () => {
    const conversionError = new Error("AST conversion failed");
    const throwing = recoveringGrammar.createSemantics();
    throwing.addAttribute<string>("root", {
      Root(_words, _corrections, _ends) {
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
    expect(outcome.diagnostics[2]).toEqual(
      diagnostic(
        "error.unexpected",
        { message: "AST conversion failed" },
        undefined,
        "semantic",
      ),
    );
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
  /** Each statement's body and correction slots, then each block's correction slot. */
  semantics.addAttribute<(RecoveryPoint | undefined)[]>("slots", {
    Root(block) {
      return block.slots;
    },
    Block(_open, items, correction, _close) {
      return [
        ...items.children.flatMap((item) => item.slots),
        correction.recovery,
      ];
    },
    Item(item) {
      return item.slots;
    },
    Stmt(body, correction, _end) {
      return [body.recovery, correction.recovery];
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

  it("links only the correction slot to its diagnostic", () => {
    const outcome = parser.parse("{ a 1; c; }");
    expect(outcome.ast).toHaveLength(5);
    expect(outcome.diagnostics).toHaveLength(1);
    const [body, correction, ...rest] = outcome.ast;
    expect(body).toBeUndefined();
    expect(correction?.recovery).toBe(outcome.diagnostics[0]);
    expect(correction?.span).toMatchObject({ start: 4, end: 5 });
    expect(rest).toEqual([undefined, undefined, undefined]);
  });

  it("returns the null root when nested blocks have no matching join", () => {
    const outcome = parser.parse("{ a; { b;");

    expect(outcome.ast).toEqual([]);
    expect(outcome.diagnostics.length).toBeGreaterThan(0);
  });

  it("keeps the guarded prefix and the real join beside the correction", () => {
    const bindings = blocks.extendSemantics(semantics);
    bindings.addAttribute("bindings", {
      Block(_open, items, correction, close) {
        return {
          items: items.children.map((item) => item.sourceString),
          correction: correction.recoveredFailure,
          join: close.sourceString,
        };
      },
    });

    const match = blocks.match("{ a; 1 }", undefined, { recover: true });
    expect(match.succeeded()).toBe(true);
    expect(bindings(match).child(0).bindings).toMatchObject({
      items: ["a;"],
      correction: { position: 5 },
      join: "}",
    });
  });

  it("is never read with recovery off", () => {
    setParserRecovery(false);
    const outcome = parser.parse("{ a 1; c; }");
    expect(isValid(outcome)).toBe(false);
    expect(outcome.ast).toEqual([]);
  });
});

describe("makeParser", () => {
  const numbers = grammar(`Nums <: Base { Root := Number+ }`, grammars);

  function throwing(thrown: () => never) {
    const semantics = numbers.extendSemantics(baseSemantics);
    semantics.addAttribute<number[]>("root", {
      Root(_nums) {
        return thrown();
      },
    });
    return makeParser<number[]>(numbers, semantics, () => []);
  }

  it("keeps a diagnostic thrown by a semantic action", () => {
    const semantics = numbers.extendSemantics(baseSemantics);
    semantics.addAttribute<number[]>("root", {
      Root(_nums) {
        throw diagnostic(
          "asm.duplicateLabel",
          { label: "A" },
          span(this.source),
        );
      },
    });
    const outcome = makeParser<number[]>(numbers, semantics, () => []).parse(
      "1",
    );

    expect(outcome.ast).toEqual([]);
    expect(outcome.diagnostics).toEqual([
      {
        code: "asm.duplicateLabel",
        args: { label: "A" },
        span: { start: 0, end: 1, line: 1 },
        stage: "semantic",
      },
    ]);
  });

  it("reports any other thrown error as an unexpected one", () => {
    const outcome = throwing(() => {
      throw new Error("boom");
    }).parse("1");

    expect(outcome.ast).toEqual([]);
    expect(outcome.diagnostics).toEqual([
      {
        code: "error.unexpected",
        args: { message: "boom" },
        stage: "semantic",
      },
    ]);
  });
});
