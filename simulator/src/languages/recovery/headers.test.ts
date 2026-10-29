/**
 * Recovery at a malformed chip or class header and at unbalanced chip or
 * class braces: the header becomes a null name that records what it stands
 * in for, the rest of the file stays intact, and the first error is the one
 * the strict parse reports.
 */
import { describe, expect, it } from "vitest";
import {
  type Diagnostic,
  isRecovered,
  isValid,
  type Outcome,
  type Parser,
} from "../base.js";
import { HDL, type HdlParse, type Part, prune } from "../hdl.js";
import { type Class, JACK, prune as jackPrune } from "../jack.js";

const lines = (...l: string[]) => l.join("\n");

const RECOVER = { attemptRecovery: true };

/** A parse that recovered: a tree that is not the null root, with diagnostics. */
type Recovered<T> = Exclude<Outcome<T>, { diagnostics: readonly [] }>;

function recovered<T>(language: Parser<T>, source: string): Recovered<T> {
  const outcome = language.parse(source, RECOVER);
  if (isValid(outcome)) throw new Error("parse is valid");
  const messages = outcome.diagnostics.map((e) => e.message).join(" | ");
  expect(outcome.ast, `parse did not recover: ${messages}`).not.toEqual(
    language.empty(),
  );
  return outcome;
}

/** The single error the strict parse reports for `source`. */
function strictError<T>(language: Parser<T>, source: string): Diagnostic {
  const outcome = language.parse(source);
  if (isValid(outcome)) throw new Error("parse is valid");
  return outcome.diagnostics[0];
}

/** A chip body that is valid after any header. */
const CHIP_BODY = [
  "  IN a;",
  "  OUT out;",
  "  PARTS:",
  "  Not(in=a, out=out);",
  "}",
];

const partNames = (chip: HdlParse) =>
  chip.parts === "BUILTIN"
    ? []
    : chip.parts.map((part: Part) =>
        isRecovered(part) ? "<error>" : part.name,
      );

describe("HDL recovery at a malformed CHIP header", () => {
  it.each([
    ["a missing chip name", "CHIP {"],
    ["a chip name that is not an identifier", "CHIP 1Not {"],
    ["a misspelled CHIP keyword", "CHP Not {"],
    ["an extra word before the brace", "CHIP Not Gate {"],
  ])("keeps the pins and parts after %s", (_, header) => {
    const source = lines(header, ...CHIP_BODY);

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ChipHead" },
    });
    expect(parsed.ast.name.recovery).toBe(parsed.diagnostics[0]);
    expect(parsed.ast.ins).toEqual([{ pin: "a", width: 1 }]);
    expect(parsed.ast.outs).toEqual([{ pin: "out", width: 1 }]);
    expect(partNames(parsed.ast)).toEqual(["Not"]);
  });
});

describe("HDL recovery at unbalanced chip braces", () => {
  it("resumes a chip missing its `{` at `PARTS:`, skipping its pins", () => {
    const source = lines("CHIP Not", ...CHIP_BODY);

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ChipStart", interval: { start: 0, end: 27 } },
    });
    expect(parsed.ast.ins).toEqual([]);
    expect(parsed.ast.outs).toEqual([]);
    expect(partNames(parsed.ast)).toEqual(["Not"]);
  });

  it("keeps a chip closed early and makes the text after it a null part", () => {
    const source = lines(
      "CHIP Not {",
      "  IN a;",
      "  OUT out;",
      "  PARTS:",
      "  Not(in=a, out=x);",
      "  }",
      "  Not(in=x, out=out);",
      "}",
    );

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.diagnostics[0].span?.line).toBe(7);
    expect(parsed.ast.name.value).toBe("Not");
    expect(partNames(parsed.ast)).toEqual(["Not", "<error>"]);
    const parts = parsed.ast.parts as Part[];
    expect(parts[1].skipped).toMatchObject({ kind: "ChipClose" });
  });

  it("keeps a chip missing its `}` at the end, with a null part for the closer", () => {
    const source = lines("CHIP Not {", ...CHIP_BODY.slice(0, -1));

    const parsed = recovered(HDL, source);

    expect(parsed.diagnostics).toEqual([strictError(HDL, source)]);
    expect(parsed.ast.name.value).toBe("Not");
    expect(parsed.ast.ins).toEqual([{ pin: "a", width: 1 }]);
    expect(partNames(parsed.ast)).toEqual(["Not", "<error>"]);
    const parts = parsed.ast.parts as Part[];
    expect(parts[1].skipped).toMatchObject({
      kind: "MissingChipClose",
      interval: { start: source.length, end: source.length },
    });
  });
});

describe("a pruned HDL header", () => {
  it("drops the null name to an empty name and keeps its provenance", () => {
    const parsed = recovered(HDL, lines("CHIP {", ...CHIP_BODY));

    const pruned = prune(parsed.ast);

    expect(pruned.name).toEqual({ value: "" });
    expect(prune.provenance(parsed.ast)).toMatchObject([
      { kind: "ChipHead", interval: { start: 0, end: 4 }, scope: [""] },
    ]);
  });
});

/** Class members that are valid after any class header. */
const CLASS_BODY = [
  "  field int x;",
  "  function void a() {",
  "    return;",
  "  }",
  "}",
];

const subroutineNames = (cls: Class) =>
  cls.subroutines.map((s) => (isRecovered(s) ? "<error>" : s.name.value));

describe("Jack recovery at a malformed class header", () => {
  it.each([
    ["a missing class name", "class {"],
    ["a class name that is not an identifier", "class 1Main {"],
    ["an extra word before the brace", "class Main extends {"],
  ])("keeps the variables and subroutines after %s", (_, header) => {
    const source = lines(header, ...CLASS_BODY);

    const parsed = recovered(JACK, source);

    expect(parsed.diagnostics).toEqual([strictError(JACK, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ClassHead" },
    });
    expect(parsed.ast.name.recovery).toBe(parsed.diagnostics[0]);
    expect(parsed.ast.varDecs).toMatchObject([{ names: ["x"] }]);
    expect(subroutineNames(parsed.ast)).toEqual(["a"]);
  });
});

describe("Jack recovery at unbalanced class braces", () => {
  it("resumes a class missing its `{` at its first subroutine", () => {
    const source = lines("class Main", ...CLASS_BODY);

    const parsed = recovered(JACK, source);

    expect(parsed.diagnostics).toEqual([strictError(JACK, source)]);
    expect(parsed.ast.name).toMatchObject({
      value: "",
      skipped: { kind: "ClassStart", interval: { start: 0, end: 25 } },
    });
    expect(parsed.ast.varDecs).toEqual([]);
    expect(subroutineNames(parsed.ast)).toEqual(["a"]);
  });

  it("does not skip into a subroutine to find a class's `{`", () => {
    const source = lines(
      "class Main",
      "  function void a() {",
      "    return;",
      "  }",
      "  function void b() {",
      "    return;",
      "  }",
      "}",
    );

    const parsed = recovered(JACK, source);

    expect(parsed.diagnostics).toHaveLength(1);
    expect(subroutineNames(parsed.ast)).toEqual(["a", "b"]);
  });

  it("still builds no class from a header and `{` alone", () => {
    const outcome = JACK.parse("class {", RECOVER);

    expect(outcome.ast).toEqual(JACK.empty());
    expect(outcome.diagnostics[0]).toEqual(strictError(JACK, "class {"));
  });
});

describe("a pruned Jack header", () => {
  it("drops the null name to an empty name and keeps its provenance", () => {
    const parsed = recovered(JACK, lines("class {", ...CLASS_BODY));

    const pruned = jackPrune(parsed.ast);

    expect(pruned.name).toEqual({ value: "", span: parsed.ast.name.span });
    expect(isRecovered(pruned.name)).toBe(false);
    expect(jackPrune.provenance(parsed.ast)).toMatchObject([
      { kind: "ClassHead", interval: { start: 0, end: 5 }, scope: [""] },
    ]);
  });
});

describe("the strict Jack message at a class with no subroutines", () => {
  // Pinned literally: the text the grammar gave before the class header
  // recovery added its `&SubroutinesStart` lookahead.
  it.each([
    ["its `{`", "class Main {", 1],
    ["a class variable's `;`", "class Main {\n  field int x;", 2],
  ])(
    'is today\'s `expected "}"` right after %s at the end',
    (_, source, line) => {
      const outcome = JACK.parse(source);

      expect(outcome.diagnostics).toEqual([
        {
          message: `Line ${line}: expected "}"`,
          span: expect.objectContaining({ line }),
          stage: "parse",
        },
      ]);
    },
  );
});
