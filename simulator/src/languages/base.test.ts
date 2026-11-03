import { Err, Ok } from "@davidsouther/jiffies/result.ts";
import { grammar } from "ohm-js";
import { beforeEach, describe, expect, it } from "vitest";
import { cleanState } from "../clean_state.js";
import {
  actionError,
  baseSemantics,
  type Diagnostic,
  type Diagnostics,
  failedOf,
  grammars,
  isRecovered,
  isValid,
  makeParser,
  makePrune,
  mergeByFile,
  mergeDiagnostics,
  type Recovery,
  type RecoveryPoint,
  recoveryOf,
  span,
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

    it("tags a failure inside a begun token as lex", () => {
      const outcome = parse("1 %XZ");

      expect(outcome.diagnostics).toEqual([
        {
          message: "Line 1: expected a hexadecimal digit",
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

  describe("prune", () => {
    interface Item extends Recovery {
      name: string;
    }
    interface Tree {
      items: Item[];
      last?: Item;
    }
    const recovery = { message: "Line 1: bad" };
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

  const RECOVER = { attemptRecovery: true };

  it.each([
    ["omitted", undefined],
    ["empty", {}],
    ["false", { attemptRecovery: false }],
  ])("keeps recovery off with options %s", (_, options) => {
    const strict = parser.parse("1;2;", options);

    expect(strict.ast).toBe("null root");
    expect(strict.diagnostics).toHaveLength(1);
  });

  it("recovers when a caller opts in", () => {
    const outcome = parser.parse("1;2;", RECOVER);

    expect(outcome.ast).toBe("partial AST");
    expect(outcome.diagnostics).toHaveLength(2);
  });

  it("validOf rejects a recovered AST and the outcome retains every diagnostic", () => {
    const recovered = parser.parse("1;2;", RECOVER);
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
    expect(() => unhandled.parse("a 1;b;", RECOVER)).toThrow(
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
    const outcome = failing.parse("1;2;", RECOVER);
    expect(isValid(outcome)).toBe(false);
    expect(outcome.ast).toBe("null root");
    expect(outcome).toHaveProperty("nullRoot", true);
    expect(outcome.diagnostics).toHaveLength(3);
    expect(outcome.diagnostics.slice(0, 2)).toEqual(
      parser.parse("1;2;", RECOVER).diagnostics,
    );
    // A non-diagnostic error becomes a spanless diagnostic.
    expect(outcome.diagnostics[2]).toEqual({
      message: "AST conversion failed",
      stage: "semantic",
    });
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
              actionError(`${this.value} is not a digit`, at),
              at,
              "Number",
            ),
          };
    },
  });
  semantics.addAttribute<Digit[]>("root", {
    Root(numbers, _ends) {
      return numbers.children.map((n) => n.digit);
    },
  });
  const parser = makeParser<Digit[]>(digits, semantics, () => []);

  it("keeps the tree, with a null object beside a semantic diagnostic", () => {
    const outcome = parser.parse("1; 23; 4;");

    expect(outcome).not.toHaveProperty("nullRoot");
    expect(outcome.diagnostics).toEqual([
      {
        message: "Line 1: 23 is not a digit",
        span: { start: 3, end: 5, line: 1 },
        stage: "semantic",
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
      Root(numbers, _ends) {
        numbers.children.forEach((n) => n.digit);
        throw new Error("unexpected");
      },
    });
    const failing = makeParser<Digit[]>(digits, throwing, () => []);

    const outcome = failing.parse("23;");

    expect(outcome).toHaveProperty("nullRoot", true);
    expect(outcome.diagnostics).toMatchObject([
      { message: "Line 1: 23 is not a digit", stage: "semantic" },
      { message: "unexpected", stage: "semantic" },
    ]);
  });
});

describe("syntax stages", () => {
  const stages = grammar(
    `Stages <: Base {
      Root := (Item ! semi)*
      Item = Number | Pair | pair | arrow
      Pair = "<" "a"
      pair = "<" "b"
      arrow = "=" ">"
    }`,
    grammars,
  );
  const semantics = stages.extendSemantics(baseSemantics);
  semantics.addAttribute<string>("root", {
    Root(_items, _ends) {
      return "partial AST";
    },
  });
  const parser = makeParser<string>(stages, semantics, () => "null root");

  it.each([
    ["a malformed token", "%XZ;", ["lex"]],
    ["a missing separator", "1 2;", ["parse"]],
    ["a token continuation beside a structural expectation", "<c;", ["parse"]],
    ["a terminal inside a token", "=x;", ["lex"]],
    ["a terminal at a token boundary", "1 =;", ["parse"]],
    ["each recovered failure", "%XZ; 1 2; =x;", ["lex", "parse", "lex"]],
  ])("tags %s", (_, source, expected) => {
    const outcome = parser.parse(source, { attemptRecovery: true });

    expect(outcome.ast).toBe("partial AST");
    expect(outcome.diagnostics.map((d) => d.stage)).toEqual(expected);
  });

  it.each([
    ["lex", "1; %XZ"],
    ["parse", "1; 2 3"],
  ])("tags an unrecoverable failure as %s", (stage, source) => {
    const outcome = parser.parse(source, { attemptRecovery: true });

    expect(outcome.ast).toBe("null root");
    expect(outcome.diagnostics.at(-1)?.stage).toBe(stage);
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

  const RECOVER = { attemptRecovery: true };

  it("is undefined everywhere in a valid parse", () => {
    const outcome = parser.parse("{ a; { b; } }", RECOVER);
    expect(outcome).toEqual({
      ast: [undefined, undefined, undefined, undefined, undefined, undefined],
      diagnostics: [],
    });
  });

  it("is undefined for an empty placeholder and links a recovery to its diagnostic", () => {
    const outcome = parser.parse("{ a 1; c; }", RECOVER);
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
    const outcome = parser.parse("{ a; { b;", RECOVER);
    expect(outcome.ast).not.toHaveLength(0);
    expect(outcome.diagnostics).toHaveLength(1);
    const closers = outcome.ast.filter((slot) => slot !== undefined);
    expect(closers).toHaveLength(2);
    for (const closer of closers) {
      expect(closer.recovery).toBe(outcome.diagnostics[0]);
    }
  });

  it("is never read with recovery off", () => {
    const outcome = parser.parse("{ a 1; c; }");
    expect(isValid(outcome)).toBe(false);
    expect(outcome.ast).toEqual([]);
  });
});

describe("merging a file's diagnostics", () => {
  const at = (start: number, end = start, line = 1) => ({ start, end, line });

  it("orders by span start with spanless records last", () => {
    const spanless: Diagnostic = { message: "no place", stage: "parse" };
    const late: Diagnostic = { message: "late", span: at(9), stage: "parse" };
    const early: Diagnostic = { message: "early", span: at(2), stage: "parse" };

    const merged = mergeDiagnostics([spanless, late, early]);

    expect(merged).toEqual([early, late, spanless]);
  });

  it("orders records at one start by stage, absent last, then input", () => {
    const unstaged: Diagnostic = { message: "unstaged", span: at(4) };
    const compile: Diagnostic = {
      message: "compile",
      span: at(4),
      stage: "compile",
    };
    const semantic: Diagnostic = {
      message: "semantic",
      span: at(4),
      stage: "semantic",
    };
    const parse: Diagnostic = { message: "parse", span: at(4), stage: "parse" };
    const lex: Diagnostic = { message: "lex", span: at(4), stage: "lex" };
    const otherParse: Diagnostic = {
      message: "other parse",
      span: at(4, 6),
      stage: "parse",
    };

    const merged = mergeDiagnostics([
      unstaged,
      compile,
      semantic,
      parse,
      otherParse,
      lex,
    ]);

    expect(merged).toEqual([
      lex,
      parse,
      otherParse,
      semantic,
      compile,
      unstaged,
    ]);
  });

  it("orders spanless records among themselves by stage", () => {
    const compile: Diagnostic = { message: "compile", stage: "compile" };
    const unstaged: Diagnostic = { message: "unstaged" };
    const parse: Diagnostic = { message: "parse", stage: "parse" };

    const merged = mergeDiagnostics([compile, unstaged, parse]);

    expect(merged).toEqual([parse, compile, unstaged]);
  });

  it("keeps the earlier stage of records with one message and span", () => {
    const semantic: Diagnostic = {
      message: "Line 3: same",
      span: at(8, 11, 3),
      stage: "semantic",
    };
    const parse: Diagnostic = {
      message: "Line 3: same",
      span: at(8, 11, 3),
      stage: "parse",
    };

    const merged = mergeDiagnostics([semantic, parse]);

    expect(merged).toEqual([parse]);
    expect(merged[0]).toBe(parse);
  });

  it("keeps distinct messages at one point", () => {
    const first: Diagnostic = { message: "one", span: at(5), stage: "parse" };
    const second: Diagnostic = {
      message: "two",
      span: at(5),
      stage: "semantic",
    };

    const merged = mergeDiagnostics([first, second]);

    expect(merged).toEqual([first, second]);
  });

  it("compares the complete span, not only its start", () => {
    const point: Diagnostic = {
      message: "m",
      span: at(5, 5, 2),
      stage: "parse",
    };
    const longer: Diagnostic = {
      message: "m",
      span: at(5, 9, 2),
      stage: "parse",
    };
    const otherLine: Diagnostic = {
      message: "m",
      span: at(5, 5, 3),
      stage: "parse",
    };

    const merged = mergeDiagnostics([point, longer, otherLine]);

    expect(merged).toEqual([point, longer, otherLine]);
  });

  it("keeps the first input of equal records at one stage", () => {
    const first: Diagnostic = { message: "m", span: at(5), stage: "semantic" };
    const second: Diagnostic = { ...first };

    const merged = mergeDiagnostics([first, second]);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toBe(first);
  });

  it("lets an absent stage inherit nothing and yield to a staged record", () => {
    const unstaged: Diagnostic = { message: "m", span: at(5) };
    const compile: Diagnostic = { message: "m", span: at(5), stage: "compile" };

    const merged = mergeDiagnostics([unstaged, compile]);

    expect(merged).toEqual([compile]);
    expect(merged[0]?.stage).toBe("compile");
    expect(unstaged).not.toHaveProperty("stage");
  });

  it("keeps spanless records with equal text", () => {
    const first: Diagnostic = { message: "m", stage: "compile" };
    const second: Diagnostic = { message: "m", stage: "compile" };
    const spanned: Diagnostic = { message: "m", span: at(1), stage: "compile" };

    const merged = mergeDiagnostics([first, second, spanned]);

    expect(merged).toEqual([spanned, first, second]);
  });

  it("merges a spanless record only with proof of one cause", () => {
    const first: Diagnostic = { message: "m", stage: "compile" };
    const second: Diagnostic = { message: "m", stage: "compile" };
    const third: Diagnostic = { message: "n", stage: "compile" };
    const origins = new Map([
      [first, { cause: "k" }],
      [third, { cause: "k" }],
    ]);

    const merged = mergeDiagnostics([first, second, third], origins);

    expect(merged).toEqual([first, second]);
    expect(merged[0]).toBe(first);
  });

  it("merges one record listed twice, spanless or not", () => {
    const spanless: Diagnostic = { message: "m", stage: "compile" };
    const spanned: Diagnostic = { message: "n", span: at(2), stage: "parse" };

    const merged = mergeDiagnostics([spanless, spanned, spanless, spanned]);

    expect(merged).toEqual([spanned, spanless]);
  });

  it("merges differently worded records only when a cause links them", () => {
    const parse: Diagnostic = { message: "one", span: at(3), stage: "parse" };
    const semantic: Diagnostic = {
      message: "two",
      span: at(7),
      stage: "semantic",
    };
    const linked = new Map([
      [parse, { cause: "k" }],
      [semantic, { cause: "k" }],
    ]);
    const unlinked = new Map([
      [parse, { cause: "k" }],
      [semantic, { cause: "j" }],
    ]);

    expect(mergeDiagnostics([semantic, parse], linked)).toEqual([parse]);
    expect(mergeDiagnostics([semantic, parse], unlinked)).toEqual([
      parse,
      semantic,
    ]);
    expect(mergeDiagnostics([semantic, parse])).toEqual([parse, semantic]);
  });

  it("keeps records of equal message and span from distinct skipped regions", () => {
    const first: Diagnostic = { message: "m", span: at(4), stage: "parse" };
    const second: Diagnostic = { message: "m", span: at(4), stage: "parse" };
    const again: Diagnostic = { message: "m", span: at(4), stage: "parse" };
    const bare: Diagnostic = { message: "m", span: at(4), stage: "parse" };
    const origins = new Map([
      [first, { recovery: "4:9" }],
      [second, { recovery: "4:12" }],
      [again, { recovery: "4:9" }],
    ]);

    const merged = mergeDiagnostics([first, second, again, bare], origins);

    expect(merged).toEqual([first, second, bare]);
    expect(merged[0]).toBe(first);
    expect(merged[1]).toBe(second);
    expect(merged[2]).toBe(bare);
  });

  it("does not change its input", () => {
    const late: Diagnostic = { message: "late", span: at(9), stage: "parse" };
    const early: Diagnostic = { message: "early", span: at(2) };
    const input: readonly Diagnostic[] = [late, early, late];

    mergeDiagnostics(input);

    expect(input).toEqual([late, early, late]);
    expect(early).toEqual({ message: "early", span: at(2) });
  });
});

describe("merging diagnostics by file", () => {
  it("never merges records of different files", () => {
    const place = { start: 3, end: 6, line: 2 };
    const top: Diagnostic = { message: "m", span: place, stage: "parse" };
    const child: Diagnostic = { message: "m", span: place, stage: "parse" };
    const topLater: Diagnostic = {
      message: "m",
      span: place,
      stage: "semantic",
    };

    const merged = mergeByFile({
      "Top.hdl": [topLater, top],
      "Child.hdl": [child],
    });

    expect(Object.keys(merged)).toEqual(["Top.hdl", "Child.hdl"]);
    expect(merged["Top.hdl"]).toEqual([top]);
    expect(merged["Child.hdl"]).toEqual([child]);
    expect(merged["Child.hdl"][0]).toBe(child);
  });

  it("does not link causes across files", () => {
    const top: Diagnostic = { message: "one", stage: "parse" };
    const child: Diagnostic = { message: "two", stage: "parse" };
    const origins = new Map([
      [top, { cause: "k" }],
      [child, { cause: "k" }],
    ]);

    const merged = mergeByFile(
      { "Top.hdl": [top], "Child.hdl": [child] },
      origins,
    );

    expect(merged["Top.hdl"]).toEqual([top]);
    expect(merged["Child.hdl"]).toEqual([child]);
  });
});
