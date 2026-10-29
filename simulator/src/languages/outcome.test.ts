/**
 * A parse gives a tree and a diagnostics list. A source that does not match,
 * or whose tree cannot be built, gives the language's null root beside a list
 * that says why, so an unparsed file differs from an empty file only in its
 * diagnostics.
 */
import { describe, expect, it } from "vitest";
import { ASM } from "./asm.js";
import {
  isRecovered,
  isValid,
  type Outcome,
  type ParseOptions,
  recoveryOf,
} from "./base.js";
import { rawCMP } from "./cmp.js";
import { HDL } from "./hdl.js";
import { JACK } from "./jack.js";
import { TST } from "./tst.js";
import { VM } from "./vm.js";

interface Language {
  parse: (source: string, options?: ParseOptions) => Outcome<unknown>;
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
    "class B",
    {
      name: { value: "", span: { start: 0, end: 0, line: 1 } },
      varDecs: [],
      subroutines: [],
    },
  ],
  ["TST", TST, "set a", { lines: [] }],
  ["CMP", rawCMP, "| a", []],
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
      expect(outcome.diagnostics[0].message).toMatch(/^Line 1: /);
    },
  );

  // Recovery finishes most line based sources, so these fail with it on too.
  it.each(NULL_ROOTS.slice(0, 3))(
    "%s gives its null root with recovery on",
    (_name, language, source, root) => {
      const outcome = language.parse(source, { attemptRecovery: true });
      expect(outcome.ast).toEqual(root);
      expect(outcome.diagnostics).not.toHaveLength(0);
      expect(isValid(outcome)).toBe(false);
    },
  );
});

describe("a semantic action error", () => {
  it.each([
    [
      "an A value out of range",
      "@32768\n",
      "Line 1: 32768 is invalid for an A instruction (should be 0 to 32767)",
      { start: 0, end: 6, line: 1 },
    ],
    [
      "an invalid C target",
      "@1\nDA=M\n",
      "Line 2: Invalid ASM target: DA. Did you mean AD?",
      { start: 3, end: 6, line: 2 },
    ],
    [
      "an invalid C value",
      "@1\nD=M+A\n",
      "Line 2: Invalid ASM value: M+A",
      { start: 5, end: 8, line: 2 },
    ],
  ])(
    "keeps the tree and lists %s as a semantic diagnostic",
    (_name, source, message, at) => {
      const outcome = ASM.parse(source);

      expect(isValid(outcome)).toBe(false);
      expect(outcome).not.toHaveProperty("nullRoot");
      expect(outcome.diagnostics).toEqual([
        { message, span: at, stage: "semantic" },
      ]);
      const broken = outcome.ast.instructions.filter(isRecovered);
      expect(broken).toHaveLength(1);
      expect(recoveryOf(broken[0])).toBe(outcome.diagnostics[0]);
    },
  );

  it("keeps the instructions around a failed one", () => {
    const outcome = ASM.parse("@1\n@32768\nD=A\n");

    expect(outcome.ast.instructions.map(isRecovered)).toEqual([
      false,
      true,
      false,
    ]);
  });
});

describe("an empty file", () => {
  it.each([
    ["CMP", rawCMP],
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
