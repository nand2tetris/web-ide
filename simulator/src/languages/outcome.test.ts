/**
 * A parse gives a tree and a diagnostics list. A source that does not match,
 * or whose tree cannot be built, gives the language's null root beside a list
 * that says why, so an unparsed file differs from an empty file only in its
 * diagnostics.
 */
import { describe, expect, it } from "vitest";
import { ASM } from "./asm.js";
import { describeEnglish, isValid, type Outcome } from "./base.js";
import { CMP } from "./cmp.js";
import { HDL } from "./hdl.js";
import { JACK } from "./jack.js";
import { TST } from "./tst.js";
import { VM } from "./vm.js";

interface Language {
  parse: (source: string) => Outcome<unknown>;
  empty: () => unknown;
}

const NULL_ROOTS: [string, Language, string, unknown][] = [
  [
    "HDL",
    HDL,
    "CHIP {",
    {
      name: { value: "" },
      ins: [],
      outs: [],
      clocked: [],
      parts: [],
    },
  ],
  [
    "Jack",
    JACK,
    "class {",
    {
      name: { value: "", span: { start: 0, end: 0, line: 1 } },
      varDecs: [],
      subroutines: [],
    },
  ],
  ["TST", TST, "set a", { lines: [] }],
  ["CMP", CMP, "| a", []],
  ["ASM", ASM, "@@", { instructions: [] }],
  ["VM", VM, "push nowhere 1", { instructions: [] }],
];

describe("a failed match", () => {
  it.each(NULL_ROOTS)(
    "%s gives its null root and a diagnostic",
    (_name, language, source, root) => {
      const outcome = language.parse(source);
      if (isValid(outcome)) throw new Error("parse is valid");
      expect(outcome.ast).toEqual(root);
      expect(outcome.ast).toEqual(language.empty());
      expect(outcome.diagnostics).not.toHaveLength(0);
      expect(describeEnglish(outcome.diagnostics[0])).toMatch(/^Line 1: /);
    },
  );

  it("gives the null root for a thrown semantic error", () => {
    const outcome = ASM.parse("@32768\n");
    expect(outcome.ast).toEqual(ASM.empty());
    expect(outcome.diagnostics).toEqual([
      {
        code: "asm.aValueRange",
        args: { value: 32768 },
        span: { start: 0, end: 6, line: 1 },
        stage: "semantic",
      },
    ]);
    expect(isValid(outcome)).toBe(false);
  });
});

describe("an empty file", () => {
  it.each([
    ["CMP", CMP],
    ["ASM", ASM],
    ["VM", VM],
  ] as [string, Language][])(
    "%s differs from an unparsed file only by its diagnostics",
    (_name, language) => {
      const empty = language.parse("");
      const unparsed = language.parse("}");
      expect(empty.ast).toEqual(unparsed.ast);
      expect(empty.diagnostics).toEqual([]);
      expect(isValid(empty)).toBe(true);
      expect(unparsed.diagnostics).not.toHaveLength(0);
      expect(isValid(unparsed)).toBe(false);
    },
  );
});
