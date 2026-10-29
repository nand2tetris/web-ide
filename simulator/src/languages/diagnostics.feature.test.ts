/**
 * Feature test: a student's file with one mistake in the grammar and another
 * mistake in a part that is grammatically fine hears about both from the final
 * call, in source order, as ordinary diagnostics with spans. The final calls
 * are the ones the IDE already makes: `parse` for HDL, `compile` for Jack,
 * `assemble` for ASM, `loadVm` for VM and `buildTst` for a test script.
 * See .ailly/developer/2026-10-29-C-unified-diagnostics/design.md.
 *
 * The final calls attempt recovery by default, without explicit setup here.
 */
import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { parse as buildChip } from "../chip/builder.js";
import { compile } from "../jack/compiler.js";
import { buildTst } from "../test/builder.js";
import { loadVm } from "../vm/vm.js";
import { assemble } from "./asm.js";
import type { Diagnostic } from "./base.js";

const lines = (...l: string[]) => l.join("\n");

const hdlDiagnostics = async (
  source: string,
): Promise<readonly Diagnostic[]> => {
  const chip = await buildChip(source);
  return isErr(chip) ? Object.values(Err(chip)).flat() : [];
};

const jackDiagnostics = async (
  source: string,
): Promise<readonly Diagnostic[]> => {
  const vm = compile({ Main: source }).Main;
  return typeof vm === "string" ? [] : vm;
};

const asmDiagnostics = async (
  source: string,
): Promise<readonly Diagnostic[]> => {
  const program = assemble(source);
  return isErr(program) ? Err(program) : [];
};

const vmDiagnostics = async (
  source: string,
): Promise<readonly Diagnostic[]> => {
  const vm = loadVm([{ name: "Main.vm", content: source }]);
  return isErr(vm) ? Object.values(Err(vm)).flat() : [];
};

const tstDiagnostics = async (
  source: string,
): Promise<readonly Diagnostic[]> => {
  const test = buildTst({ name: "Foo.tst", content: source }, "chip");
  return isErr(test) ? Err(test) : [];
};

const STORIES: [
  string,
  (source: string) => Promise<readonly Diagnostic[]>,
  string,
  { syntaxLines: number[]; semantic: RegExp; semanticLine: number },
][] = [
  [
    "HDL: a part missing a comma, and a part naming a chip that does not exist",
    hdlDiagnostics,
    lines(
      "CHIP Foo {", //            1
      "  IN a;", //               2
      "  OUT out;", //            3
      "  PARTS:", //              4
      "  Nand(a=a b=a, out=x);", // 5: syntax error, no comma
      "  Nope(a=x, out=out);", //   6: grammatical, but Nope is not a chip
      "}", //                     7
    ),
    {
      syntaxLines: [5],
      semantic: /Undefined chip name: Nope/,
      semanticLine: 6,
    },
  ],
  [
    "Jack: a statement missing a semicolon, and a subroutine using an undeclared variable",
    jackDiagnostics,
    lines(
      "class Main {", //               1
      "  function void a() {", //      2
      "    return;", //                 3
      "    let x = 1", //               4: syntax error, no semicolon
      "  }", //                         5
      "  function void b() {", //      6
      "    let y = 2;", //              7: grammatical, but y is not declared
      "    return;", //                 8
      "  }", //                         9
      "}", //                          10
    ),
    { syntaxLines: [4, 5], semantic: /Undeclared variable y/, semanticLine: 7 },
  ],
  [
    "HDL: a CHIP header with no name, and a part naming a chip that does not exist",
    hdlDiagnostics,
    lines(
      "CHIP {", //                  1: syntax error, no chip name
      "  IN a;", //                 2
      "  OUT out;", //              3
      "  PARTS:", //                4
      "  Nope(a=a, out=out);", //   5: grammatical, but Nope is not a chip
      "}", //                       6
    ),
    {
      syntaxLines: [1],
      semantic: /Undefined chip name: Nope/,
      semanticLine: 5,
    },
  ],
  [
    "Jack: a class header with no name, and a subroutine using an undeclared variable",
    jackDiagnostics,
    lines(
      "class {", //                 1: syntax error, no class name
      "  function void a() {", //   2
      "    let y = 2;", //          3: grammatical, but y is not declared
      "    return;", //             4
      "  }", //                     5
      "}", //                       6
    ),
    { syntaxLines: [1], semantic: /Undeclared variable y/, semanticLine: 3 },
  ],
  [
    "ASM: an instruction that is not a command, and a label defined twice",
    asmDiagnostics,
    lines(
      "(LOOP)", //   1
      "@1", //       2
      "D=Q", //      3: syntax error, Q is not a value
      "(LOOP)", //   4: grammatical, but LOOP is already defined
      "0;JMP", //    5
    ),
    { syntaxLines: [3], semantic: /Duplicate label LOOP/, semanticLine: 4 },
  ],
  [
    "VM: a line that is not an instruction, and a function that redeclares a label",
    vmDiagnostics,
    lines(
      "function Main.main 0", //  1
      "push constant 1", //       2
      "push nowhere 2", //        3: syntax error, nowhere is not a segment
      "label LOOP", //            4
      "label LOOP", //            5: grammatical, but LOOP is already declared
      "return", //                6
    ),
    {
      syntaxLines: [3],
      semantic: /Cannot redeclare label LOOP/,
      semanticLine: 5,
    },
  ],
  [
    "TST: a block missing its closer, and a script with no load command",
    tstDiagnostics,
    "repeat 1 { eval;", // 1: syntax error, no `}`; and no load command
    {
      syntaxLines: [1],
      semantic: /A test script must have a load command/,
      semanticLine: 1,
    },
  ],
];

describe("one call reports syntax and semantic diagnostics together", () => {
  it.each(STORIES)("%s", async (_story, finalCall, source, expected) => {
    const diagnostics = await finalCall(source);

    // The skipped Jack statement must not report its own undeclared `x`;
    // the skipped HDL part must not cause an undriven-`x` cascade.
    expect(diagnostics).toHaveLength(2);
    const [syntax, semantic] = diagnostics;

    expect(expected.syntaxLines).toContain(syntax.span?.line);
    expect(semantic.span?.line).toBe(expected.semanticLine);
    expect(semantic.message).toMatch(expected.semantic);
    expect(syntax.message).not.toMatch(expected.semantic);
  });
});
