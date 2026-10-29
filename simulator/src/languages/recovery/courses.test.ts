/**
 * F5 own tests: recovery on never changes what a course file or a mistaken
 * file reports first, and a valid course file recovers nothing.
 */
import { Err } from "@davidsouther/jiffies/result.ts";
import * as full from "@nand2tetris/projects/full.js";
import * as samples from "@nand2tetris/projects/samples/index.js";
import * as testing from "@nand2tetris/projects/testing/index.js";
import { describe, expect, it } from "vitest";
import { ASM, type Asm } from "../asm.js";
import {
  type Diagnostic,
  type Diagnostics,
  isRecovered,
  isValid,
  type Outcome,
  type ParseOptions,
  validOf,
} from "../base.js";
import { CMP } from "../cmp.js";
import { TST } from "../tst.js";

/** The tree and the error list of a parse. */
const parsedOf = (result: Outcome<unknown>) => ({
  ast: result.ast,
  errors: [...result.diagnostics],
});

/** A valid parse: a tree and no diagnostics. */
const expectValid = (result: Outcome<unknown>) =>
  expect(isValid(result)).toBe(true);

interface Language {
  parse: (source: string, options?: ParseOptions) => Outcome<unknown>;
}

const LANGUAGES: Record<string, Language> = {
  tst: TST,
  cmp: CMP,
  out: CMP,
  asm: ASM,
};

/** Every string named like a TST, CMP, OUT or ASM file in the course packages. */
function courseFiles(): Map<string, string> {
  const files = new Map<string, string>();
  const seen = new Set<unknown>();
  const walk = (value: unknown, path: string) => {
    if (typeof value !== "object" || value === null || seen.has(value)) return;
    seen.add(value);
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === "string" && /\.(tst|cmp|out|asm)$/.test(key)) {
        files.set(`${path}/${key}`, child);
      } else {
        walk(child, `${path}/${key}`);
      }
    }
  };
  walk(full, "full");
  walk(testing, "testing");
  walk(samples, "samples");
  return files;
}

const extension = (name: string) => name.slice(name.lastIndexOf(".") + 1);

const RECOVER = { attemptRecovery: true };

describe("TST, CMP and ASM recovery over the course files", () => {
  const files = courseFiles();

  it("finds the course files", () => {
    for (const ext of ["tst", "cmp", "asm"]) {
      expect([...files.keys()].some((name) => extension(name) === ext)).toBe(
        true,
      );
    }
    expect(files.size).toBeGreaterThan(100);
  });

  it.each([...files.entries()])("%s parses with no errors", (name, source) => {
    const result = LANGUAGES[extension(name)].parse(source, RECOVER);
    expectValid(result);
    expect(parsedOf(result).errors).toEqual([]);
  });
});

const JUMP = 'expected "JMP", "JLE", "JNE", "JLT", "JGE", "JEQ", or "JGT"';

const NOT_TST = [
  "load Not.hdl,",
  "output-file Not.out,",
  "compare-to Not.cmp,",
  "output-list in out;",
  "",
  "set in 0,",
  "eval,",
  "output;",
];

const MISTAKES: Record<string, [Language, string][]> = {
  TST: [
    [TST, NOT_TST.join("\n").replace("set in 0,", "set in,")],
    [TST, NOT_TST.join("\n").replace("eval,", "evl,")],
    [TST, NOT_TST.join("\n").replace("output;", "output")],
    [TST, "repeat 2 {\n  tick,\n  tock\n}\noutput;"],
    [TST, "set n,\nrepeat 2 {\n  tick,\n  tock;\n}\nwhile n < 3 {\n  evl;\n}"],
    [TST, "repeat 2 {\n  tick,\n  tock;\n"],
    [TST, `load Not.hdl,\n${",\n;\n!\n".repeat(3)}output;`],
  ],
  CMP: [
    [CMP, "|  in  | out |\n    0  |   1 |\n"],
    [CMP, "|  in  | out |\n|   0  |   1 |\n|   1  |   0  "],
    [CMP, "|  in  | out |\n|   0  |   1 |\nxyz\n"],
  ],
  ASM: [
    [ASM, "@2\nD=Q\n@3\n"],
    [ASM, "@2\nX=1\n"],
    [ASM, "@2\nM=D;JUMP\n"],
    [ASM, "@2\nM=D;JUMP"],
    [ASM, "@2\nD=Q"],
    [ASM, "@2\n@32768\n"],
    [ASM, "@2\nMD=D+1\nDA=M\n"],
    [ASM, "@2\n(LOOP\nD=A\n"],
  ],
};

describe("recovery leaves the first error byte for byte", () => {
  it("keeps every syntax diagnostic and the tree when an action fails", () => {
    const source = "@@\n@@\n@32768\n";
    const plain = ASM.parse(source);
    const recovered = ASM.parse(source, RECOVER);
    const strict = validOf(ASM.parse(source, RECOVER));

    if (isValid(plain)) throw new Error("parse is valid");
    const first = plain.diagnostics[0];
    if (isValid(recovered)) throw new Error("parse is valid");
    expect(recovered.ast.instructions.map(isRecovered)).toEqual([
      true,
      true,
      true,
    ]);
    expect(strict).toBeErr();
    for (const errors of [
      recovered.diagnostics,
      Err(strict as Err<Diagnostics>),
    ]) {
      expect(errors[0].message).toBe(first.message);
      expect(errors).toMatchObject([
        { message: first.message, span: { line: 1 } },
        { span: { line: 2 } },
        {
          message:
            "Line 3: 32768 is invalid for an A instruction (should be 0 to 32767)",
          stage: "semantic",
        },
      ]);
    }
  });

  it.each(
    Object.entries(MISTAKES).flatMap(([name, cases]) =>
      cases.map(([language, source], i) => [`${name} ${i}`, language, source]),
    ) as [string, Language, string][],
  )("%s", (_name, language, source) => {
    const strict = language.parse(source);
    const recovering = language.parse(source, RECOVER);
    if (isValid(strict)) throw new Error("parse is valid");
    if (isValid(recovering)) throw new Error("parse is valid");
    const expected: Diagnostic = strict.diagnostics[0];
    // Recovery may finish (first error in the list) or not (today's first).
    const first: Diagnostic = recovering.diagnostics[0];
    expect(first.message).toBe(expected.message);
    expect(first.span?.line).toBe(expected.span?.line);
  });
});

describe("ASM last line with no trailing newline", () => {
  it("parses a valid last line with no errors", () => {
    const result = ASM.parse("@2\nD=A", RECOVER);
    expectValid(result);
    expect(parsedOf(result).errors).toEqual([]);
    expect((parsedOf(result).ast as Asm).instructions).toHaveLength(2);
  });

  it("recovers a broken last line like any other line", () => {
    const result = ASM.parse("@2\nM=D;JUMP", RECOVER);
    expect(result.ast).not.toEqual(ASM.empty());
    expect(parsedOf(result).errors).toMatchObject([
      { message: `Line 2: ${JUMP}` },
    ]);
    const instructions = (parsedOf(result).ast as Asm).instructions;
    expect(instructions.map(isRecovered)).toEqual([false, true]);
  });
});
