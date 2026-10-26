/**
 * F6 own tests: recovery on never changes what an HDL or VM course file or a
 * mistaken file reports first, and a valid course file recovers nothing.
 */
import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import * as full from "@nand2tetris/projects/full.js";
import * as samples from "@nand2tetris/projects/samples/index.js";
import * as testing from "@nand2tetris/projects/testing/index.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  type CompilationError,
  isParserRecoveryEnabled,
  type Parsed,
  type ParseResult,
  setParserRecovery,
} from "./base.js";
import { HDL } from "./hdl.js";
import { VM } from "./vm.js";

/** The parsed value of a result already asserted to be Ok. */
const parsedOf = (result: ParseResult<unknown>): Parsed<unknown> =>
  Ok(result as Ok<Parsed<unknown>>);

interface Language {
  parse: (source: string) => ParseResult<unknown>;
}

const LANGUAGES: Record<string, Language> = { hdl: HDL, vm: VM };

/** Every string named like an HDL or VM file in the course packages. */
function courseFiles(): Map<string, string> {
  const files = new Map<string, string>();
  const seen = new Set<unknown>();
  const walk = (value: unknown, path: string) => {
    if (typeof value !== "object" || value === null || seen.has(value)) return;
    seen.add(value);
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === "string" && /\.(hdl|vm)$/.test(key)) {
        // Redacted solutions are placeholders, not chips.
        if (!child.includes("REDACTED")) files.set(`${path}/${key}`, child);
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

describe("HDL and VM recovery over the course files", () => {
  const before = isParserRecoveryEnabled();
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(before));

  const files = courseFiles();

  it("finds the course files", () => {
    for (const ext of ["hdl", "vm"]) {
      expect([...files.keys()].some((name) => extension(name) === ext)).toBe(
        true,
      );
    }
    expect(files.size).toBeGreaterThan(50);
  });

  it.each([...files.entries()])("%s parses with no errors", (name, source) => {
    const result = LANGUAGES[extension(name)].parse(source);
    expect(result).toBeOk();
    expect(parsedOf(result).errors).toEqual([]);
  });
});

/** The error table of hdl.test.ts, then chips that lack a separator. */
const HDL_MISTAKES = [
  "Not { BUILTIN }",
  "CHIP { BUILTIN }",
  "CHIP Not BUILTIN }",
  "CHIP Not { BUILTIN }",
  "CHIP Not { BONKERS; }",
  "CHIP Not { ",
  "CHIP Not { PARTS: (); }",
  "CHIP Not { PARTS: Nand; }",
  "CHIP Not { PARTS: Nand() }",
  "CHIP Not { PARTS: Nand(=a) }",
  "CHIP Not { PARTS: Nand(a=) }",
  "CHIP Not { PARTS: Nand(a) }",
  "CHIP Not { PARTS: Nand(a=a }",
  "CHIP Not {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a b=a, out=x);\n Nand(a=x, b=x, out=out)\n}",
  "CHIP Not {\n IN a\n OUT out;\n PARTS:\n Nand(a=a, b=a, out=out);\n}",
  "CHIP Not {\n IN a;\n OUT out;\n PARTS:\n Nand(a=a, b=a, out=out);\n CLOCKED a\n}",
];

/** The error table of vm.test.ts, then instructions with typos. */
const VM_MISTAKES = [
  "call mult",
  "push invalid",
  "push constant 7\npsh constant 8\nadd\n",
  "push constant\nadd",
  "push constant 7\npop locl 0\n",
  "push constant 7\nadd 3\n",
];

const MISTAKES: [string, Language, string][] = [
  ...HDL_MISTAKES.map((s, i): [string, Language, string] => [
    `HDL ${i}`,
    HDL,
    s,
  ]),
  ...VM_MISTAKES.map((s, i): [string, Language, string] => [`VM ${i}`, VM, s]),
];

describe("recovery leaves the first error byte for byte", () => {
  it.each(MISTAKES)("%s", (_name, language, source) => {
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

describe("VM last line with no trailing newline", () => {
  beforeAll(() => setParserRecovery(true));
  afterAll(() => setParserRecovery(false));

  it("parses a valid last line with no errors", () => {
    const result = VM.parse("push constant 7\nadd");
    expect(result).toBeOk();
    expect(parsedOf(result).errors).toEqual([]);
    expect(VM.parseStrict("push constant 7\nadd")).toBeOk();
  });
});
