import { i18n } from "@lingui/core";
import {
  type DiagnosticArgs,
  DiagnosticCode,
  describeDiagnostic as describeInEnglish,
  diagnostic,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import { beforeEach, describe, expect, it } from "vitest";
import { describeDiagnostic } from "./diagnostics";
import { describeStatus } from "./statusline";

/** One argument object for every code; a new code must add its sample here. */
const SAMPLES: { [C in DiagnosticCode]: DiagnosticArgs[C] } = {
  [DiagnosticCode.Syntax.EXPECTED]: { expected: ['"a"', '"b"', '"c"'] },
  [DiagnosticCode.Error.UNEXPECTED]: { message: "boom" },
  [DiagnosticCode.Asm.INVALID_TARGET]: { target: "DA", suggestion: "AD" },
  [DiagnosticCode.Asm.INVALID_VALUE]: { value: "M+A" },
  [DiagnosticCode.Asm.A_VALUE_RANGE]: { value: 32768 },
  [DiagnosticCode.Asm.DUPLICATE_LABEL]: { label: "LOOP" },
  [DiagnosticCode.Tst.MISSING_LOAD]: {},
  [DiagnosticCode.Chip.BUS_RANGE]: {},
  [DiagnosticCode.Chip.NOT_LOADED]: { file: "Foo.hdl" },
  [DiagnosticCode.Chip.MULTIPLE_WRITES]: { pin: "out", index: 2 },
  [DiagnosticCode.Chip.WRONG_NAME]: {},
  [DiagnosticCode.Chip.NOT_BUILTIN]: { name: "Foo" },
  [DiagnosticCode.Chip.NOT_FOUND]: { name: "Foo" },
  [DiagnosticCode.Chip.SELF_REFERENCE]: { name: "Foo" },
  [DiagnosticCode.Chip.LOOPING_WIRE]: { pin: "x" },
  [DiagnosticCode.Chip.UNDEFINED_PIN]: { pin: "x" },
  [DiagnosticCode.Chip.INTERNAL_PIN_SUBSCRIPTED]: { pin: "x" },
  [DiagnosticCode.Chip.INTERNAL_PIN_REDEFINED]: { pin: "x" },
  [DiagnosticCode.Chip.WRITE_TO_INPUT]: { pin: "x" },
  [DiagnosticCode.Chip.INTERNAL_PIN_RESERVED]: {},
  [DiagnosticCode.Chip.OUTPUT_AS_INPUT]: {},
  [DiagnosticCode.Chip.CONSTANT_SUBSCRIPTED]: {},
  [DiagnosticCode.Chip.CONSTANT_CASE]: { name: "true" },
  [DiagnosticCode.Chip.UNDEFINED_INTERNAL_PIN]: { name: "x" },
  [DiagnosticCode.Chip.BUS_WIDTH_MISMATCH]: {
    lhs: "a",
    lhsWidth: 1,
    rhs: "b[0..1]",
    rhsWidth: 2,
  },
  [DiagnosticCode.Chip.CONSTANT_BUS_TARGET]: {},
  [DiagnosticCode.Chip.SUB_BUS_RANGE]: { pin: "a", width: 4 },
  [DiagnosticCode.Chip.CIRCULAR_PINS]: {},
  [DiagnosticCode.Vm.ILLEGAL_SUBROUTINE_NAME]: { name: "bar" },
  [DiagnosticCode.Vm.FILE_NAME_MISMATCH]: {
    file: "Other.vm",
    className: "Foo",
    name: "Foo.f",
  },
  [DiagnosticCode.Vm.DUPLICATE_FILE]: { file: "Main.vm" },
  [DiagnosticCode.Vm.ILLEGAL_LOCAL_COUNT]: { count: -1 },
  [DiagnosticCode.Vm.ILLEGAL_ARG_COUNT]: { count: 40000 },
  [DiagnosticCode.Vm.OS_ARG_COUNT]: {
    name: "Math.multiply",
    expected: 2,
    received: 3,
  },
  [DiagnosticCode.Vm.UNDEFINED_FUNCTION]: { name: "Nope.f" },
  [DiagnosticCode.Vm.NO_FILES]: {},
  [DiagnosticCode.Vm.DUPLICATE_LABEL]: {
    label: "L",
    function: "Main.f",
    line: 3,
  },
  [DiagnosticCode.Vm.UNDECLARED_LABEL]: { label: "END" },
  [DiagnosticCode.Vm.DUPLICATE_FUNCTION]: { name: "Main.f" },
  [DiagnosticCode.Vm.BOOTSTRAP_AND_IMPLICIT]: {},
  [DiagnosticCode.Vm.NO_ENTRY_POINT]: {},
  [DiagnosticCode.Vm.ILLEGAL_OFFSET]: { offset: -1 },
  [DiagnosticCode.Vm.POINTER_OUT_OF_BOUNDS]: { offset: 2 },
  [DiagnosticCode.Vm.STATIC_OUT_OF_BOUNDS]: { offset: 300 },
  [DiagnosticCode.Vm.TEMP_OUT_OF_BOUNDS]: { offset: 8 },
  [DiagnosticCode.Jack.UNDECLARED_VARIABLE]: { name: "y" },
  [DiagnosticCode.Jack.UNKNOWN_TYPE]: { type: "Foo" },
  [DiagnosticCode.Jack.OS_INTERFACE]: {
    class: "Math",
    subroutine: "abs",
    signature: "sig",
  },
  [DiagnosticCode.Jack.ARG_COUNT]: { name: "Main.f", expected: 1, received: 2 },
  [DiagnosticCode.Jack.METHOD_CALLED_AS_FUNCTION]: { name: "Main.f" },
  [DiagnosticCode.Jack.CALLED_AS_METHOD]: { kind: "function", name: "Main.f" },
  [DiagnosticCode.Jack.MISSING_SUBROUTINE]: { class: "B", subroutine: "h" },
  [DiagnosticCode.Jack.UNDEFINED_CLASS]: { name: "Nope" },
  [DiagnosticCode.Jack.CLASS_NAME_MISMATCH]: { name: "Foo", file: "Main" },
  [DiagnosticCode.Jack.DUPLICATE_SUBROUTINE]: { name: "a" },
  [DiagnosticCode.Jack.MISSING_RETURN_VALUE]: {},
  [DiagnosticCode.Jack.MISSING_RETURN_PATH]: { name: "main" },
};

const span = { start: 8, end: 14, line: 4 };

beforeEach(() => i18n.activate("en"));

describe("describeDiagnostic in English", () => {
  it.each(Object.keys(SAMPLES) as DiagnosticCode[])(
    "words %s as describeInEnglish does",
    (code) => {
      const found = diagnostic(code, SAMPLES[code]);
      expect(describeDiagnostic(found)).toBe(describeInEnglish(found));
      const located = diagnostic(code, SAMPLES[code], span);
      expect(describeDiagnostic(located)).toBe(describeInEnglish(located));
    },
  );

  it.each([
    diagnostic(DiagnosticCode.Syntax.EXPECTED, { expected: [] }),
    diagnostic(DiagnosticCode.Syntax.EXPECTED, { expected: ['"x"'] }),
    diagnostic(DiagnosticCode.Syntax.EXPECTED, { expected: ['"x"', '"y"'] }),
    diagnostic(DiagnosticCode.Syntax.EXPECTED, {
      expected: ["a", "b", "c", "d"],
    }),
    diagnostic(DiagnosticCode.Asm.INVALID_TARGET, { target: "DA" }),
    diagnostic(DiagnosticCode.Asm.INVALID_VALUE, {
      value: "M+A",
      suggestion: "A+M",
    }),
    diagnostic(DiagnosticCode.Chip.MULTIPLE_WRITES, { pin: "out" }),
    diagnostic(DiagnosticCode.Chip.BUS_WIDTH_MISMATCH, {
      lhs: "a",
      lhsWidth: undefined,
      rhs: "b",
      rhsWidth: 2,
    }),
    diagnostic(DiagnosticCode.Asm.A_VALUE_RANGE, { value: 1234567 }),
    diagnostic(DiagnosticCode.Jack.CALLED_AS_METHOD, {
      kind: "constructor",
      name: "A.new",
    }),
    diagnostic(DiagnosticCode.Jack.CALLED_AS_METHOD, {
      kind: "task",
      name: "A.run",
    }),
  ])("words the variant %j as describeInEnglish does", (found) => {
    expect(describeDiagnostic(found)).toBe(describeInEnglish(found));
  });
});

describe("describeStatus in English", () => {
  it("leads with the file and its count, then lists each diagnostic", () => {
    const own = diagnostic(DiagnosticCode.Chip.WRONG_NAME, {});
    const other = diagnostic(
      DiagnosticCode.Chip.NOT_FOUND,
      { name: "Foo" },
      span,
    );
    expect(
      describeStatus({
        severity: "ERROR",
        heading: { file: "HDL code", count: 3 },
        diagnostics: [{ diagnostic: own }, { diagnostic: other }],
      }),
    ).toBe(
      "HDL code: 3 syntax errors. Wrong chip name. Line 4: Undefined chip name: Foo",
    );
  });

  it("counts a single syntax error and omits an absent heading", () => {
    const only = diagnostic(DiagnosticCode.Chip.WRONG_NAME, {});
    expect(
      describeStatus({
        severity: "ERROR",
        heading: { file: "ASM code", count: 1 },
        diagnostics: [],
      }),
    ).toBe("ASM code: 1 syntax error");
    expect(
      describeStatus({ severity: "INFO", diagnostics: [{ diagnostic: only }] }),
    ).toBe("Wrong chip name");
  });
});
