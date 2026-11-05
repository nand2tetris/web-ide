import { expect, it } from "vitest";
import { isRecovered, isValid, recoveryOf, validOf } from "../base.js";
import { describeDiagnostic } from "../diagnostic.js";
import { VM } from "../vm.js";

const RECOVER = { attemptRecovery: true };

const MISTAKES = [
  "call mult",
  "push invalid",
  "push constant 7\npsh constant 8\nadd\n",
  "push constant\nadd",
  "push constant 7\npop locl 0\n",
  "push constant 7\nadd 3\n",
];

it.each(MISTAKES)(
  "VM recovery preserves the strict first displayed message and line for %j",
  (source) => {
    const strict = VM.parse(source);
    const recovering = VM.parse(source, RECOVER);
    if (isValid(strict) || isValid(recovering))
      throw new Error("expected diagnostics");
    expect(describeDiagnostic(recovering.diagnostics[0])).toBe(
      describeDiagnostic(strict.diagnostics[0]),
    );
    expect(recovering.diagnostics[0].span?.line).toBe(
      strict.diagnostics[0].span?.line,
    );
  },
);

it("parses a valid last VM line with no trailing newline", () => {
  const result = VM.parse("push constant 7\nadd", RECOVER);
  expect(validOf(result)).toBeOk();
  expect(result.diagnostics).toEqual([]);
});

it("VM reports every mistake and links each null instruction to its listed diagnostic", () => {
  const result = VM.parse(
    "// Adds two numbers\npush constant\npsh constant 8\nadd\npop locl 0\nlabel END\ngoto END\n",
    RECOVER,
  );
  expect(result).not.toHaveProperty("nullRoot");
  expect(result.diagnostics.map((d) => describeDiagnostic(d))).toEqual([
    'Line 2: expected a space, "/*", or "//"',
    "Line 3: expected end of input",
    'Line 5: expected "temp", "pointer", "that", "this", "constant", "static", "local", or "argument"',
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

it("VM parses the intact addition program without recovery placeholders", () => {
  const result = VM.parse(
    "// Adds two numbers\npush constant 7\npush constant 8\nadd\npop local 0\nlabel END\ngoto END\n",
    RECOVER,
  );
  expect(validOf(result)).toBeOk();
  expect(result.diagnostics).toEqual([]);
  expect(result.ast.instructions.some(isRecovered)).toBe(false);
});
