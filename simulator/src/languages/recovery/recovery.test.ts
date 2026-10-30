/**
 * Acceptance test for error recovery. One parse of a file with several syntax
 * mistakes returns a partial AST and every mistake, each on its line, with the
 * message the strict parse gives when that mistake is the only one, and
 * nothing on a line without a mistake. Code that needs a valid AST asks
 * `validOf`, which refuses a partial AST with the strict parse's first error.
 * A typo in a statement's first token recovers like any other mistake. Valid
 * files recover nothing, recovery never swallows a block's closer or a
 * legitimate alternative, every recovery consumes input, and a file that
 * recovery cannot finish fails with the strict parse's error first, carrying
 * every error the parse found.
 */
import { Err, isErr, type Result } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { ASM } from "../asm.js";
import {
  type Diagnostic,
  describeEnglish,
  isRecovered,
  isValid,
  type Outcome,
  type ParseOptions,
  type Recovery,
  recoveryOf,
  validOf,
} from "../base.js";
import { rawCMP } from "../cmp.js";
import { HDL, type Part } from "../hdl.js";
import { JACK } from "../jack.js";
import { TST } from "../tst.js";
import { VM } from "../vm.js";

const RECOVER = { attemptRecovery: true };

interface Expected {
  line: number;
  message: string;
}

interface Language {
  // biome-ignore lint/suspicious/noExplicitAny: each language has its own AST type
  parse: (source: string, options?: ParseOptions) => Outcome<any>;
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

/** A diagnostic as the English text and place a student sees. */
const described = (found: Diagnostic) => ({
  message: describeEnglish(found),
  span: found.span,
});

const asError = ({ line, message }: Expected) => ({
  message: `Line ${line}: ${message}`,
  span: { line },
});

function expectRecovered({ language, valid, edits, errors }: Group) {
  const result = language.parse(inject(valid, edits), RECOVER);
  expectFinished(language, result);
  const parsed = parsedOf(result);
  expect(parsed.errors.map(described)).toMatchObject(errors.map(asError));
  const strict = strictOf(result);
  expect(strict).toBeErr();
  expect(described(Err(strict) as unknown as Diagnostic)).toMatchObject(
    asError(errors[0]),
  );
}

function expectValidGroup({ language, valid }: Group) {
  const result = language.parse(valid.join("\n"), RECOVER);
  expectValid(result);
  expect(parsedOf(result).errors).toEqual([]);
  expect(strictOf(result)).toBeOk();
}

const SEPARATOR = 'expected ",", "!", or ";"';
const ALU_OP = 'expected "&", "|", "+", "-", "!", "1", "0", "D", "M", or "A"';
const JUMP = 'expected "JMP", "JLE", "JNE", "JLT", "JGE", "JEQ", or "JGT"';
const WIRE_SEPARATOR = 'expected ")", ",", or "["';
const _WIRE_VALUE = 'expected "false", "true", or a letter';
const SPACE = 'expected a space, "/*", or "//"';
const END = "expected end of input";
const TST_SETTING = 'expected "%B", ".", a digit, or "%X"';
const TST_OPERATIONS =
  '"resetRam", "ROM32K", "clear-echo", "echo", "output", "set", "vmstep", "tock", "tick", "ticktock", "eval", "output-list", "compare-to", "output-file", or "load"';
const TST_COMMAND = `expected ${TST_OPERATIONS}`;
const TST_ANY = `expected end of input, "while", "repeat", ${TST_OPERATIONS}`;
const SEGMENT =
  'expected "temp", "pointer", "that", "this", "constant", "static", "local", or "argument"';

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
      language: rawCMP,
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
  "F6: HDL and VM": {
    HDL: {
      language: HDL,
      valid: [
        "CHIP Xor {",
        "    IN a, b;",
        "    OUT out;",
        "",
        "    PARTS:",
        "    Not(in=a, out=nota);",
        "    Not(in=b, out=notb);",
        "    And(a=a, b=notb, out=w1);",
        "    And(a=nota, b=b, out=w2);",
        "    Or(a=w1, b=w2, out=out);",
        "}",
      ],
      // Line 7 is a typo in the part's first token.
      edits: {
        6: "    Not(in=a out=nota);",
        7: "    1Not(in=b, out=notb);",
        10: "    Or(a=w1 b=w2, out=out);",
      },
      errors: [
        { line: 6, message: WIRE_SEPARATOR },
        { line: 7, message: 'expected "}", "CLOCKED", or a letter' },
        { line: 10, message: WIRE_SEPARATOR },
      ],
    },
    VM: {
      language: VM,
      valid: [
        "// Adds two numbers",
        "push constant 7",
        "push constant 8",
        "add",
        "pop local 0",
        "label END",
        "goto END",
        "",
      ],
      // Line 3 is a typo in the instruction's first token.
      edits: { 2: "push constant", 3: "psh constant 8", 5: "pop locl 0" },
      errors: [
        { line: 2, message: SPACE },
        { line: 3, message: END },
        { line: 5, message: SEGMENT },
      ],
    },
  },
  "F7: Jack": {
    Jack: {
      language: JACK,
      valid: [
        "class Main {",
        "    function void main() {",
        "        var int x;",
        "        let x = 1;",
        "        do Output.printInt(x);",
        "        return;",
        "    }",
        "}",
      ],
      edits: {
        3: "        var int;",
        4: "        let x 1;",
        5: "        do Output.printInt(x;",
      },
      errors: [
        { line: 3, message: SPACE },
        { line: 4, message: 'expected "="' },
        { line: 5, message: 'expected ")"' },
      ],
    },
  },
};

describe("Fallible error recovery: every mistake from one parse", () => {
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

  describe("null objects in TST, CMP, ASM and VM", () => {
    it.each(["TST", "CMP", "ASM", "VM"])(
      "%s leaves one null object per mistake, holding its listed diagnostic",
      (name) => {
        const group = {
          ...GROUPS["F5: TST, CMP and ASM"],
          ...GROUPS["F6: HDL and VM"],
        }[name];
        const result = group.language.parse(
          inject(group.valid, group.edits),
          RECOVER,
        );
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
    const result = language.parse(source, RECOVER);
    expectFinished(language, result);
    expect(parsedOf(result).errors.map(described)).toMatchObject(
      errors.map(asError),
    );
  };

  describe("F5: hazards in TST", () => {
    it("(a) stops at a block's closer instead of swallowing it", () => {
      expectValid(
        TST.parse("repeat 2 {\n  tick,\n  tock;\n}\noutput;", RECOVER),
      );
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

  describe("F6: hazards in HDL, and null parts", () => {
    it.each([
      "CHIP K { OUT out; PARTS: Nand(a=true, b=true, out=out); }",
      "CHIP K { IN a; OUT out; PARTS: DFF(in=a, out=out); CLOCKED a; }",
    ])("still parses %s", (source) => {
      expectValid(HDL.parse(source, RECOVER));
      expect(parsedOf(HDL.parse(source, RECOVER)).errors).toEqual([]);
    });

    it("(b) leaves a CLOCKED line to the clocked list", () => {
      expectErrors(
        HDL,
        "CHIP K {\n IN a;\n OUT out;\n PARTS:\n DFF(in=a out=out);\n CLOCKED a;\n}",
        [{ line: 5, message: WIRE_SEPARATOR }],
      );
    });

    it("(a) stops at the chip's closer when the last part lacks `;`", () => {
      expectErrors(
        HDL,
        "CHIP K {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a, b=a, out=x);\n Nand(a=x, b=x, out=out)\n}",
        [{ line: 7, message: 'expected ";"' }],
      );
    });

    it("(a) reports a broken part and a first-token typo before `}`, in order", () => {
      expectErrors(
        HDL,
        "CHIP K {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a b=a, out=x);\n 1Nand(a=x, b=x, out=out)\n}",
        [
          { line: 5, message: WIRE_SEPARATOR },
          { line: 6, message: 'expected "}", "CLOCKED", or a letter' },
        ],
      );
    });

    it("(a) keeps the parts before a last part that lacks its closer", () => {
      const source = [
        "CHIP Xor {",
        "    IN a, b;",
        "    OUT out;",
        "    PARTS:",
        "    Not(in=a, out=nota);",
        "    Not(in=b, out=notb);",
        "    Or(a=nota, b=notb, out=out",
        "}",
      ].join("\n");
      expectErrors(HDL, source, [{ line: 8, message: WIRE_SEPARATOR }]);
      const parts = parsedOf(HDL.parse(source, RECOVER)).ast.parts;
      expect(parts.filter(isRecovered)).toHaveLength(1);
      expect(parts.filter((part: Part) => !isRecovered(part))).toHaveLength(2);
    });

    it("puts one null part in the parts list per broken part", () => {
      const { valid, edits } = GROUPS["F6: HDL and VM"].HDL;
      const parsed = parsedOf(HDL.parse(inject(valid, edits), RECOVER));
      expect(parsed.ast.parts.filter(isRecovered)).toHaveLength(3);
    });

    it("returns the null root when a damaged chip has no matching closer", () => {
      const source = [
        "CHIP K {",
        "    IN a;",
        "    OUT out;",
        "    PARTS:",
        "    Nand(a=a b=a, out=x);",
        "    Nand(a=x b=x, out=out);",
        "",
      ].join("\n");
      const result = HDL.parse(source, RECOVER);
      expect(isValid(result)).toBe(false);
      expect(result).toHaveProperty("nullRoot", true);
      expect(result.ast).toEqual(HDL.empty());
      expect(described(result.diagnostics[0] as Diagnostic)).toMatchObject(
        asError({ line: 5, message: WIRE_SEPARATOR }),
      );
    });
  });

  describe("F7: first-token typos and hazards in Jack", () => {
    const STATEMENT = 'expected "}", "return", "do", "while", "if", or "let"';

    it("recovers first-token typos in a class and in an if body", () => {
      const source = [
        "class Main {",
        "  feld int x;",
        "  function void main() {",
        "    if (x) {",
        "      evl x;",
        "    }",
        "    let x = 1;",
        "    return;",
        "  }",
        "}",
      ].join("\n");
      expectErrors(JACK, source, [
        {
          line: 2,
          message:
            'expected "}", "method", "function", "constructor", "field", or "static"',
        },
        { line: 5, message: STATEMENT },
      ]);
    });

    it("(b) keeps nested if, else and while blocks valid", () => {
      const source = [
        "class Main {",
        "  field int x;",
        "  function void main() {",
        "    if (x) {",
        "      let x = 1;",
        "    } else {",
        "      do f();",
        "    }",
        "    while (x) {",
        "      let x = 2;",
        "    }",
        "    return;",
        "  }",
        "}",
      ].join("\n");
      expectErrors(JACK, source, []);
    });

    it("(a) a missing `;` at the end of a body keeps the earlier statements", () => {
      const source = [
        "class Main {",
        "  function void main() {",
        "    let x = 1;",
        "    do f();",
        "    let y = 2",
        "  }",
        "}",
      ].join("\n");
      expectErrors(JACK, source, [
        {
          line: 6,
          message:
            'expected ";", "=", ">", "<", "|", "&", "/", "*", "-", or "+"',
        },
      ]);
    });

    it("(a) a missing `;` before a while body's `}` keeps the closer", () => {
      const source = [
        "class Main {",
        "  function void main() {",
        "    while (x) {",
        "      let x = 1",
        "    }",
        "    do Output.printInt(x);",
        "    return;",
        "  }",
        "}",
      ].join("\n");
      expectErrors(JACK, source, [
        {
          line: 5,
          message:
            'expected ";", "=", ">", "<", "|", "&", "/", "*", "-", or "+"',
        },
      ]);
    });

    it("(a) a first-token typo before `}` does not swallow the next subroutine", () => {
      const source = [
        "class Main {",
        "  function void a() {",
        "    let x = 1;",
        "    evl x",
        "  }",
        "  function void b() {",
        "    let y = 2;",
        "    return;",
        "  }",
        "}",
      ].join("\n");
      expectErrors(JACK, source, [{ line: 4, message: STATEMENT }]);
    });
  });
});
