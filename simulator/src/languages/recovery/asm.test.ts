import { Err } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { ASM } from "../asm.js";
import { isRecovered, isValid, recoveryOf, validOf } from "../base.js";
import {
  DiagnosticCode,
  type Diagnostics,
  describeDiagnostic,
  Stage,
} from "../diagnostic.js";

const RECOVER = { attemptRecovery: true };
const JUMP = ['"JMP"', '"JLE"', '"JNE"', '"JLT"', '"JGE"', '"JEQ"', '"JGT"'];

describe("ASM recovery", () => {
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
      expect(describeDiagnostic(errors[0])).toBe(describeDiagnostic(first));
      expect(errors).toMatchObject([
        { code: first.code, args: first.args, span: { line: 1 } },
        { span: { line: 2 } },
        {
          code: DiagnosticCode.Asm.A_VALUE_RANGE,
          args: { value: 32768 },
          span: { line: 3 },
          stage: Stage.SEMANTIC,
        },
      ]);
    }
  });
});

describe("ASM last line with no trailing newline", () => {
  it("parses a valid last line with no errors", () => {
    const result = ASM.parse("@2\nD=A", RECOVER);
    expect(isValid(result)).toBe(true);
    expect(result.diagnostics).toEqual([]);
    expect(result.ast.instructions).toHaveLength(2);
  });

  it("recovers a broken last line like any other line", () => {
    const result = ASM.parse("@2\nM=D;JUMP", RECOVER);
    expect(result.ast).not.toEqual(ASM.empty());
    expect(result.diagnostics).toMatchObject([
      {
        code: DiagnosticCode.Syntax.EXPECTED,
        args: { expected: JUMP },
        span: { line: 2 },
      },
    ]);
    const instructions = result.ast.instructions;
    expect(instructions.map(isRecovered)).toEqual([false, true]);
  });
});

it.each([
  ["@2\nD=Q\n@3\n"],
  ["@2\nX=1\n"],
  ["@2\nM=D;JUMP\n"],
  ["@2\nM=D;JUMP"],
  ["@2\nD=Q"],
  ["@2\n@32768\n"],
  ["@2\nMD=D+1\nDA=M\n"],
  ["@2\n(LOOP\nD=A\n"],
])(
  "ASM recovery preserves its strict first displayed message and line for %j",
  (source) => {
    const strict = ASM.parse(source);
    const recovered = ASM.parse(source, RECOVER);
    if (isValid(strict) || isValid(recovered))
      throw new Error("malformed source parsed without diagnostics");
    expect(describeDiagnostic(recovered.diagnostics[0])).toBe(
      describeDiagnostic(strict.diagnostics[0]),
    );
    expect(recovered.diagnostics[0].span?.line).toBe(
      strict.diagnostics[0].span?.line,
    );
  },
);

it("ASM reports every mistake and links each null instruction to its listed diagnostic", () => {
  const result = ASM.parse(
    "// Computes R0 = 2 + 3\n@2\nD=Q\nX=1\nD=D+A\n@0\nM=D;JUMP\n",
    RECOVER,
  );
  expect(result).not.toHaveProperty("nullRoot");
  expect(result.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
    'Line 3: expected "&", "|", "+", "-", "!", "1", "0", "D", "M", or "A"',
    "Line 4: expected end of input",
    'Line 7: expected "JMP", "JLE", "JNE", "JLT", "JGE", "JEQ", or "JGT"',
  ]);
  const broken = result.ast.instructions.filter(isRecovered);
  expect(broken).toHaveLength(3);
  broken.forEach((node, i) =>
    expect(recoveryOf(node)).toBe(result.diagnostics[i]),
  );
  expect(
    result.ast.instructions.filter((node) => !isRecovered(node)),
  ).toHaveLength(3);
  expect(validOf(result)).toBeErr();
});

it("ASM parses the intact addition program without recovery placeholders", () => {
  const result = ASM.parse(
    "// Computes R0 = 2 + 3\n@2\nD=A\n@3\nD=D+A\n@0\nM=D\n",
    RECOVER,
  );
  expect(validOf(result)).toBeOk();
  expect(result.diagnostics).toEqual([]);
  expect(result.ast.instructions.some(isRecovered)).toBe(false);
});
