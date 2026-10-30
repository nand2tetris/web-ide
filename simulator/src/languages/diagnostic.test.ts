import { describe, expect, it } from "vitest";
import {
  type DiagnosticArgs,
  DiagnosticCode,
  describeDiagnostic,
  diagnostic,
  faultKey,
  Stage,
} from "./diagnostic.js";

/** One argument object for every code; a new code must add its sample here. */
const SAMPLES: { [C in DiagnosticCode]: DiagnosticArgs[C] } = {
  [DiagnosticCode.Syntax.EXPECTED]: { expected: ['"a"', '"b"'] },
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

describe("describeDiagnostic", () => {
  it.each(Object.keys(SAMPLES) as DiagnosticCode[])(
    "has a template for %s",
    (code) => {
      const text = describeDiagnostic(diagnostic(code, SAMPLES[code]));

      expect(text).not.toBe("");
      expect(text).not.toMatch(/undefined|\[object/);
    },
  );

  it("prefixes the line of a span", () => {
    const found = diagnostic(
      DiagnosticCode.Asm.DUPLICATE_LABEL,
      { label: "LOOP" },
      { start: 8, end: 14, line: 4 },
    );

    expect(describeDiagnostic(found)).toBe("Line 4: Duplicate label LOOP");
  });

  it("gives no prefix without a span", () => {
    expect(
      describeDiagnostic(diagnostic(DiagnosticCode.Vm.NO_ENTRY_POINT, {})),
    ).toBe("Could not determine an entry point for VM");
  });

  it.each([
    [['"x"'], 'expected "x"'],
    [['"x"', '"y"'], 'expected "x" or "y"'],
    [['"x"', '"y"', '"z"'], 'expected "x", "y", or "z"'],
    [['"w"', '"x"', '"y"', '"z"'], 'expected "w", "x", "y", or "z"'],
    [["a letter", '"}"'], 'expected a letter or "}"'],
  ])("lists the expectations %j as Ohm words them", (expected, text) => {
    const found = diagnostic(
      DiagnosticCode.Syntax.EXPECTED,
      { expected },
      { start: 0, end: 0, line: 2 },
    );

    expect(describeDiagnostic(found)).toBe(`Line 2: ${text}`);
  });

  it("offers the reversed spelling of an invalid ASM word", () => {
    expect(
      describeDiagnostic(
        diagnostic(DiagnosticCode.Asm.INVALID_TARGET, {
          target: "DA",
          suggestion: "AD",
        }),
      ),
    ).toBe("Invalid ASM target: DA. Did you mean AD?");
    expect(
      describeDiagnostic(
        diagnostic(DiagnosticCode.Asm.INVALID_VALUE, { value: "M+A" }),
      ),
    ).toBe("Invalid ASM value: M+A");
  });

  it("names the repeated index of a pin written twice", () => {
    expect(
      describeDiagnostic(
        diagnostic(DiagnosticCode.Chip.MULTIPLE_WRITES, {
          pin: "out",
          index: 2,
        }),
      ),
    ).toBe("Cannot write to pin out[2] multiple times");
    expect(
      describeDiagnostic(
        diagnostic(DiagnosticCode.Chip.MULTIPLE_WRITES, { pin: "out" }),
      ),
    ).toBe("Cannot write to pin out multiple times");
  });
});

describe("diagnostic", () => {
  it("leaves no key for an absent span or stage", () => {
    expect(diagnostic(DiagnosticCode.Vm.NO_FILES, {})).toStrictEqual({
      code: DiagnosticCode.Vm.NO_FILES,
      args: {},
    });
  });

  it("keeps the span and stage it is given", () => {
    const span = { start: 1, end: 2, line: 3 };

    expect(
      diagnostic(DiagnosticCode.Vm.NO_FILES, {}, span, Stage.SEMANTIC),
    ).toStrictEqual({
      code: DiagnosticCode.Vm.NO_FILES,
      args: {},
      span,
      stage: Stage.SEMANTIC,
    });
  });
});

describe("faultKey", () => {
  it("is equal for equal code and arguments whatever their key order", () => {
    const a = diagnostic(DiagnosticCode.Vm.OS_ARG_COUNT, {
      name: "f",
      expected: 1,
      received: 2,
    });
    const b = diagnostic(DiagnosticCode.Vm.OS_ARG_COUNT, {
      received: 2,
      expected: 1,
      name: "f",
    });

    expect(faultKey(a)).toBe(faultKey(b));
  });

  it("differs for a different argument or code", () => {
    const base = diagnostic(DiagnosticCode.Chip.NOT_FOUND, { name: "x" });

    expect(faultKey(base)).not.toBe(
      faultKey(diagnostic(DiagnosticCode.Chip.NOT_FOUND, { name: "y" })),
    );
    expect(faultKey(base)).not.toBe(
      faultKey(diagnostic(DiagnosticCode.Chip.NOT_BUILTIN, { name: "x" })),
    );
  });
});
