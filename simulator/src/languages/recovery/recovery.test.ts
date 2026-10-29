/**
 * Project acceptance test for Fallible error recovery (web-ide issue #3).
 *
 * Story: a student's file has several syntax mistakes. One parse returns a
 * partial AST and a list of every mistake, each on its line, with the same
 * message the parser gives today when that mistake is the only one, and
 * nothing on a line without a mistake. Code that needs a valid AST asks
 * `validOf`, which refuses a partial AST with today's first error.
 * A typo in a statement's first token recovers like any other mistake.
 * Valid files parse with an empty error list, recovery never swallows a
 * block's closer or a legitimate alternative, every recovery consumes input,
 * and a file that recovery cannot finish fails with today's error first,
 * carrying every error the parse found.
 *
 * Staged per language group: each `describe` block goes green in its
 * feature-step (F5: TST, CMP, ASM; F6: HDL, VM; F7: Jack).
 */
import { Err, isErr, type Result } from "@davidsouther/jiffies/result.ts";
import { beforeAll, describe, expect, it } from "vitest";
import { ASM } from "../asm.js";
import {
  type Diagnostic,
  isRecovered,
  isValid,
  type Outcome,
  type Recovery,
  recoveryOf,
  setParserRecovery,
  validOf,
} from "../base.js";
import { CMP } from "../cmp.js";
import { TST } from "../tst.js";

interface Expected {
  line: number;
  message: string;
}

interface Language {
  // biome-ignore lint/suspicious/noExplicitAny: each language has its own AST type
  parse: (source: string) => Outcome<any>;
  empty: () => unknown;
}

/** The tree and the error list of a parse. */
// biome-ignore lint/suspicious/noExplicitAny: each language has its own AST type
const parsedOf = (result: Outcome<any>) => ({
  ast: result.ast,
  errors: [...result.diagnostics],
});

/** A finished parse: a tree that is not the language's null root. */
const expectFinished = (language: Language, result: Outcome<unknown>) =>
  expect(result.ast).not.toEqual(language.empty());

/** A valid parse: a tree and no diagnostics. */
const expectValid = (result: Outcome<unknown>) =>
  expect(isValid(result)).toBe(true);

/** The strict view through `validOf`, refused with the first error. */
const strictOf = (result: Outcome<unknown>): Result<unknown, Diagnostic> => {
  const strict = validOf(result);
  return isErr(strict) ? Err(Err(strict)[0]) : strict;
};

interface Group {
  language: Language;
  valid: string[];
  edits: Record<number, string>;
  errors: Expected[];
}

/** Replace whole lines (1 based) of a valid file with broken ones. */
function inject(lines: string[], edits: Record<number, string>): string {
  const copy = [...lines];
  for (const [line, text] of Object.entries(edits)) {
    copy[Number(line) - 1] = text;
  }
  return copy.join("\n");
}

const asError = ({ line, message }: Expected) => ({
  message: `Line ${line}: ${message}`,
  span: { line },
});

function expectRecovered({ language, valid, edits, errors }: Group) {
  const result = language.parse(inject(valid, edits));
  expectFinished(language, result);
  const parsed = parsedOf(result);
  expect(parsed.errors).toMatchObject(errors.map(asError));
  const strict = strictOf(result);
  expect(strict).toBeErr();
  expect(Err(strict)).toMatchObject(asError(errors[0]));
}

function expectValidGroup({ language, valid }: Group) {
  const result = language.parse(valid.join("\n"));
  expectValid(result);
  expect(parsedOf(result).errors).toEqual([]);
  expect(strictOf(result)).toBeOk();
}

const SEPARATOR = 'expected ",", "!", or ";"';
const ALU_OP = 'expected "&", "|", "+", "-", "!", "1", "0", "D", "M", or "A"';
const JUMP = 'expected "JMP", "JLE", "JNE", "JLT", "JGE", "JEQ", or "JGT"';
const END = "expected end of input";
const TST_SETTING = 'expected "%B", ".", a digit, or "%X"';
const TST_OPERATIONS =
  '"resetRam", "ROM32K", "clear-echo", "echo", "output", "set", "vmstep", "tock", "tick", "ticktock", "eval", "output-list", "compare-to", "output-file", or "load"';
const TST_COMMAND = `expected ${TST_OPERATIONS}`;
const TST_ANY = `expected end of input, "while", "repeat", ${TST_OPERATIONS}`;

const NOT_TST = [
  "load Not.hdl,",
  "output-file Not.out,",
  "compare-to Not.cmp,",
  "output-list in out;",
  "",
  "set in 0,",
  "eval,",
  "output;",
  "",
  "set in 1,",
  "eval,",
  "output;",
];

const GROUPS: Record<string, Record<string, Group>> = {
  "F5: TST, CMP and ASM": {
    TST: {
      language: TST,
      valid: NOT_TST,
      // Line 7 is a typo in the command's first token.
      edits: { 6: "set in,", 7: "evl,", 11: "eval 1," },
      errors: [
        { line: 6, message: TST_SETTING },
        { line: 7, message: TST_ANY },
        { line: 11, message: SEPARATOR },
      ],
    },
    CMP: {
      language: CMP,
      valid: ["|  in  | out |", "|   0  |   1 |", "|   1  |   0 |"],
      // Line 2 is missing its first token, the leading bar.
      edits: { 2: "    0  |   1 |", 3: "|   1  |   0  " },
      errors: [
        { line: 2, message: 'expected end of input or "|"' },
        { line: 3, message: 'expected "|"' },
      ],
    },
    ASM: {
      language: ASM,
      valid: [
        "// Computes R0 = 2 + 3",
        "@2",
        "D=A",
        "@3",
        "D=D+A",
        "@0",
        "M=D",
        "",
      ],
      // Line 4 is a typo in the instruction's first token.
      edits: { 3: "D=Q", 4: "X=1", 7: "M=D;JUMP" },
      errors: [
        { line: 3, message: ALU_OP },
        { line: 4, message: END },
        { line: 7, message: JUMP },
      ],
    },
  },
};

describe("Fallible error recovery: every mistake from one parse", () => {
  // The release flag is off by default; this test exercises the flag on.
  beforeAll(() => setParserRecovery(true));

  for (const [step, languages] of Object.entries(GROUPS)) {
    describe(step, () => {
      for (const [name, group] of Object.entries(languages)) {
        describe(name, () => {
          it("parses a valid file with no errors", () =>
            expectValidGroup(group));
          it("reports every mistake with a partial AST", () =>
            expectRecovered(group));
        });
      }
    });
  }

  /** Every node in a tree that carries a recovery, in tree order. */
  const recoveredNodes = (value: unknown): unknown[] => {
    if (typeof value !== "object" || value === null) return [];
    const own = isRecovered(value) ? [value] : [];
    const children = Array.isArray(value) ? value : Object.values(value);
    return [...own, ...children.flatMap(recoveredNodes)];
  };

  describe("null objects in TST, CMP and ASM", () => {
    it.each(["TST", "CMP", "ASM"])(
      "%s leaves one null object per mistake, holding its listed diagnostic",
      (name) => {
        const group = GROUPS["F5: TST, CMP and ASM"][name];
        const result = group.language.parse(inject(group.valid, group.edits));
        expect(isValid(result)).toBe(false);
        expectFinished(group.language, result);
        const { ast, errors } = parsedOf(result);
        const nodes = recoveredNodes(ast);
        expect(nodes).toHaveLength(errors.length);
        nodes.forEach((node, i) => {
          expect(recoveryOf(node as Recovery)).toBe(errors[i]);
        });
      },
    );
  });

  /** Parse with recovery and expect exactly these errors. */
  const expectErrors = (
    language: Language,
    source: string,
    errors: Expected[],
  ) => {
    const result = language.parse(source);
    expectFinished(language, result);
    expect(parsedOf(result).errors).toMatchObject(errors.map(asError));
  };

  describe("F5: hazards in TST", () => {
    it("(a) stops at a block's closer instead of swallowing it", () => {
      expectValid(TST.parse("repeat 2 {\n  tick,\n  tock;\n}\noutput;"));
      // The missing separator is reported where the next token, `}`, begins.
      expectErrors(TST, "repeat 2 {\n  tick,\n  tock\n}\noutput;", [
        { line: 4, message: SEPARATOR },
      ]);
    });

    it("(b) leaves repeat and while to their own alternatives", () => {
      const valid =
        "set n 0,\nrepeat 2 {\n  tick,\n  tock;\n}\nwhile n < 3 {\n  eval;\n}\noutput;";
      expectErrors(TST, valid, []);
      expectErrors(
        TST,
        "set n,\nrepeat 2 {\n  tick,\n  tock;\n}\nwhile n < 3 {\n  evl;\n}\noutput;",
        [
          { line: 1, message: TST_SETTING },
          { line: 7, message: TST_COMMAND },
        ],
      );
    });

    it("(c) consumes input on every recovery and terminates", () => {
      const strays = `load Not.hdl,\n${",\n;\n!\n".repeat(7)}output;`;
      expectErrors(
        TST,
        strays,
        Array.from({ length: 21 }, (_, i) => ({
          line: i + 2,
          message: TST_ANY,
        })),
      );
    });

    it.each([
      ['ech "a, b";\noutput;', `expected "while", "repeat", ${TST_OPERATIONS}`],
      ['echo hello "x; y";\noutput;', 'expected "\\""'],
    ])(
      "(d) skips a string after the failure point whole in %j",
      (source, message) => {
        expectErrors(TST, source, [{ line: 1, message }]);
      },
    );
  });
});
