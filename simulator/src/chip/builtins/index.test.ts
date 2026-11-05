import { Err } from "@davidsouther/jiffies/result.ts";
import { afterEach, expect, it } from "vitest";
import { DiagnosticCode } from "../../languages/diagnostic.js";
import { builtinOverrides } from "./builtinOverrides.js";
import { getBuiltinChip } from "./index.js";

afterEach(() => {
  delete builtinOverrides.I18nFailure;
});

it("reports a missing built-in chip as a typed diagnostic", async () => {
  const result = await getBuiltinChip("MissingBuiltin");
  expect(result).toBeErr();
  expect(Err(result)).toMatchObject({
    code: DiagnosticCode.Chip.NOT_BUILTIN,
    args: { name: "MissingBuiltin" },
  });
});

it("preserves the first override diagnostic and its span", async () => {
  builtinOverrides.I18nFailure =
    "CHIP I18nFailure { IN a; PARTS: Nand(a=a, b=a, out=); }";
  const result = await getBuiltinChip("I18nFailure");
  expect(result).toBeErr();
  expect(Err(result)).toMatchObject({
    code: DiagnosticCode.Syntax.EXPECTED,
    span: { line: 1 },
  });
});
