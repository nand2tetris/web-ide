import { describe, expect, it } from "vitest";
import {
  type DiagnosticArgs,
  type DiagnosticCode,
  describeEnglish,
  diagnostic,
  faultKey,
} from "./diagnostic.js";

/** One argument object for every code; a new code must add its sample here. */
const SAMPLES: { [C in DiagnosticCode]: DiagnosticArgs[C] } = {
  "syntax.expected": { expected: ['"a"', '"b"'] },
  "error.unexpected": { message: "boom" },
  "asm.invalidTarget": { target: "DA", suggestion: "AD" },
  "asm.invalidValue": { value: "M+A" },
  "asm.aValueRange": { value: 32768 },
  "asm.duplicateLabel": { label: "LOOP" },
  "tst.missingLoad": {},
  "chip.busRange": {},
  "chip.notLoaded": { file: "Foo.hdl" },
  "chip.multipleWrites": { pin: "out", index: 2 },
  "chip.wrongName": {},
  "chip.notBuiltin": { name: "Foo" },
  "chip.notFound": { name: "Foo" },
  "chip.selfReference": { name: "Foo" },
  "chip.loopingWire": { pin: "x" },
  "chip.undefinedPin": { pin: "x" },
  "chip.internalPinSubscripted": { pin: "x" },
  "chip.internalPinRedefined": { pin: "x" },
  "chip.writeToInput": { pin: "x" },
  "chip.internalPinReserved": {},
  "chip.outputAsInput": {},
  "chip.constantSubscripted": {},
  "chip.constantCase": { name: "true" },
  "chip.undefinedInternalPin": { name: "x" },
  "chip.busWidthMismatch": {
    lhs: "a",
    lhsWidth: 1,
    rhs: "b[0..1]",
    rhsWidth: 2,
  },
  "chip.constantBusTarget": {},
  "chip.subBusRange": { pin: "a", width: 4 },
  "chip.circularPins": {},
  "vm.illegalSubroutineName": { name: "bar" },
  "vm.fileNameMismatch": { file: "Other.vm", className: "Foo", name: "Foo.f" },
  "vm.duplicateFile": { file: "Main.vm" },
  "vm.illegalLocalCount": { count: -1 },
  "vm.illegalArgCount": { count: 40000 },
  "vm.osArgCount": { name: "Math.multiply", expected: 2, received: 3 },
  "vm.undefinedFunction": { name: "Nope.f" },
  "vm.noFiles": {},
  "vm.duplicateLabel": { label: "L", function: "Main.f", line: 3 },
  "vm.undeclaredLabel": { label: "END" },
  "vm.duplicateFunction": { name: "Main.f" },
  "vm.bootstrapAndImplicit": {},
  "vm.noEntryPoint": {},
  "vm.illegalOffset": { offset: -1 },
  "vm.pointerOutOfBounds": { offset: 2 },
  "vm.staticOutOfBounds": { offset: 300 },
  "vm.tempOutOfBounds": { offset: 8 },
  "jack.undeclaredVariable": { name: "y" },
  "jack.unknownType": { type: "Foo" },
  "jack.osInterface": { class: "Math", subroutine: "abs", signature: "sig" },
  "jack.argCount": { name: "Main.f", expected: 1, received: 2 },
  "jack.methodCalledAsFunction": { name: "Main.f" },
  "jack.calledAsMethod": { kind: "function", name: "Main.f" },
  "jack.missingSubroutine": { class: "B", subroutine: "h" },
  "jack.undefinedClass": { name: "Nope" },
  "jack.classNameMismatch": { name: "Foo", file: "Main" },
  "jack.duplicateClassFile": { path: "b/Main", other: "a/Main" },
  "jack.duplicateSubroutine": { name: "a" },
  "jack.missingReturnValue": {},
  "jack.missingReturnPath": { name: "main" },
};

describe("describeEnglish", () => {
  it.each(Object.keys(SAMPLES) as DiagnosticCode[])(
    "has a template for %s",
    (code) => {
      const text = describeEnglish(diagnostic(code, SAMPLES[code]));

      expect(text).not.toBe("");
      expect(text).not.toMatch(/undefined|\[object/);
    },
  );

  it("prefixes the line of a span", () => {
    const found = diagnostic(
      "asm.duplicateLabel",
      { label: "LOOP" },
      { start: 8, end: 14, line: 4 },
    );

    expect(describeEnglish(found)).toBe("Line 4: Duplicate label LOOP");
  });

  it("gives no prefix without a span", () => {
    expect(describeEnglish(diagnostic("vm.noEntryPoint", {}))).toBe(
      "Could not determine an entry point for VM",
    );
  });

  it.each([
    [['"x"'], 'expected "x"'],
    [['"x"', '"y"'], 'expected "x" or "y"'],
    [['"x"', '"y"', '"z"'], 'expected "x", "y", or "z"'],
    [['"w"', '"x"', '"y"', '"z"'], 'expected "w", "x", "y", or "z"'],
    [["a letter", '"}"'], 'expected a letter or "}"'],
  ])("lists the expectations %j as Ohm words them", (expected, text) => {
    const found = diagnostic(
      "syntax.expected",
      { expected },
      { start: 0, end: 0, line: 2 },
    );

    expect(describeEnglish(found)).toBe(`Line 2: ${text}`);
  });

  it("offers the reversed spelling of an invalid ASM word", () => {
    expect(
      describeEnglish(
        diagnostic("asm.invalidTarget", { target: "DA", suggestion: "AD" }),
      ),
    ).toBe("Invalid ASM target: DA. Did you mean AD?");
    expect(
      describeEnglish(diagnostic("asm.invalidValue", { value: "M+A" })),
    ).toBe("Invalid ASM value: M+A");
  });

  it("names the repeated index of a pin written twice", () => {
    expect(
      describeEnglish(
        diagnostic("chip.multipleWrites", { pin: "out", index: 2 }),
      ),
    ).toBe("Cannot write to pin out[2] multiple times");
    expect(
      describeEnglish(diagnostic("chip.multipleWrites", { pin: "out" })),
    ).toBe("Cannot write to pin out multiple times");
  });
});

describe("diagnostic", () => {
  it("leaves no key for an absent span or stage", () => {
    expect(diagnostic("vm.noFiles", {})).toStrictEqual({
      code: "vm.noFiles",
      args: {},
    });
  });

  it("keeps the span and stage it is given", () => {
    const span = { start: 1, end: 2, line: 3 };

    expect(diagnostic("vm.noFiles", {}, span, "semantic")).toStrictEqual({
      code: "vm.noFiles",
      args: {},
      span,
      stage: "semantic",
    });
  });
});

describe("faultKey", () => {
  it("is equal for equal code and arguments whatever their key order", () => {
    const a = diagnostic("vm.osArgCount", {
      name: "f",
      expected: 1,
      received: 2,
    });
    const b = diagnostic("vm.osArgCount", {
      received: 2,
      expected: 1,
      name: "f",
    });

    expect(faultKey(a)).toBe(faultKey(b));
  });

  it("differs for a different argument or code", () => {
    const base = diagnostic("chip.notFound", { name: "x" });

    expect(faultKey(base)).not.toBe(
      faultKey(diagnostic("chip.notFound", { name: "y" })),
    );
    expect(faultKey(base)).not.toBe(
      faultKey(diagnostic("chip.notBuiltin", { name: "x" })),
    );
  });
});
