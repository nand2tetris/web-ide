/**
 * Feature test: a student's file with one mistake in the grammar and another
 * mistake in a part that is grammatically fine hears about both from the final
 * call, in source order, as ordinary diagnostics with spans. The final calls
 * are the ones the IDE already makes: `parse` for HDL and `compile` for Jack.
 * See .ailly/developer/2026-10-29-C-unified-diagnostics/design.md.
 *
 * The final calls attempt recovery by default, without explicit setup here.
 */
import { Err, isErr } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { parse as buildChip } from "../chip/builder.js";
import { compile } from "../jack/compiler.js";
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
