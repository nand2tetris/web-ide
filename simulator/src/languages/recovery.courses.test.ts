/**
 * F5 own tests: recovery on never changes what a course file or a mistaken
 * file reports first, and a valid course file recovers nothing.
 */
import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import * as full from "@nand2tetris/projects/full.js";
import * as samples from "@nand2tetris/projects/samples/index.js";
import * as testing from "@nand2tetris/projects/testing/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ASM, type Asm, type AsmPartial } from "./asm.js";
import {
  type CompilationError,
  isParseError,
  isParserRecoveryEnabled,
  type Parsed,
  type ParseResult,
  setParserRecovery,
} from "./base.js";
import { CMP } from "./cmp.js";
import { TST } from "./tst.js";

/** The parsed value of a result already asserted to be Ok. */
const parsedOf = (result: ParseResult<unknown>): Parsed<unknown> =>
  Ok(result as Ok<Parsed<unknown>>);

interface Language {
  parse: (source: string) => ParseResult<unknown>;
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

describe("TST, CMP and ASM recovery over the course files", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

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
    const result = LANGUAGES[extension(name)].parse(source);
    expect(result).toBeOk();
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
  it.each(
    Object.entries(MISTAKES).flatMap(([name, cases]) =>
      cases.map(([language, source], i) => [`${name} ${i}`, language, source]),
    ) as [string, Language, string][],
  )("%s", (_name, language, source) => {
    const before = isParserRecoveryEnabled();
    setParserRecovery(false);
    const strict = language.parse(source);
    setParserRecovery(true);
    const recovering = language.parse(source);
    setParserRecovery(before);
    expect(strict).toBeErr();
    const expected: CompilationError = Err(strict as Err<CompilationError>);
    // Recovery may finish (Ok, first error in the list) or not (Err).
    const first: CompilationError = isErr(recovering)
      ? Err(recovering as Err<CompilationError>)
      : parsedOf(recovering).errors[0];
    expect(first.message).toBe(expected.message);
    expect(first.span?.line).toBe(expected.span?.line);
  });
});

describe("ASM last line with no trailing newline", () => {
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(false));

  it("parses a valid last line with no errors", () => {
    const result = ASM.parse("@2\nD=A");
    expect(result).toBeOk();
    expect(parsedOf(result).errors).toEqual([]);
    expect((parsedOf(result).ast as Asm).instructions).toHaveLength(2);
  });

  it("recovers a broken last line like any other line", () => {
    const result = ASM.parse("@2\nM=D;JUMP");
    expect(result).toBeOk();
    expect(parsedOf(result).errors).toMatchObject([
      { message: `Line 2: ${JUMP}` },
    ]);
    const instructions = (parsedOf(result).ast as AsmPartial).instructions;
    expect(instructions.map(isParseError)).toEqual([false, true]);
  });
});
