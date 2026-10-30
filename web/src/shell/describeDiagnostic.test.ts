import { i18n } from "@lingui/core";
import {
  type DiagnosticArgs,
  type DiagnosticCode,
  describeEnglish,
  diagnostic,
} from "@nand2tetris/simulator/languages/base.js";
import { beforeEach, describe, expect, it } from "vitest";
import { describeDiagnostic } from "./diagnostics";
import { describeStatus } from "./statusline";

/** One argument object for every code; a new code must add its sample here. */
const SAMPLES: { [C in DiagnosticCode]: DiagnosticArgs[C] } = {
  "syntax.expected": { expected: ['"a"', '"b"', '"c"'] },
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
  "jack.duplicateSubroutine": { name: "a" },
  "jack.missingReturnValue": {},
  "jack.missingReturnPath": { name: "main" },
};

const span = { start: 8, end: 14, line: 4 };

beforeEach(() => i18n.activate("en"));

describe("describeDiagnostic in English", () => {
  it.each(Object.keys(SAMPLES) as DiagnosticCode[])(
    "words %s as describeEnglish does",
    (code) => {
      const found = diagnostic(code, SAMPLES[code]);
      expect(describeDiagnostic(found)).toBe(describeEnglish(found));
      const located = diagnostic(code, SAMPLES[code], span);
      expect(describeDiagnostic(located)).toBe(describeEnglish(located));
    },
  );

  it.each([
    diagnostic("syntax.expected", { expected: [] }),
    diagnostic("syntax.expected", { expected: ['"x"'] }),
    diagnostic("syntax.expected", { expected: ['"x"', '"y"'] }),
    diagnostic("syntax.expected", { expected: ["a", "b", "c", "d"] }),
    diagnostic("asm.invalidTarget", { target: "DA" }),
    diagnostic("asm.invalidValue", { value: "M+A", suggestion: "A+M" }),
    diagnostic("chip.multipleWrites", { pin: "out" }),
    diagnostic("chip.busWidthMismatch", {
      lhs: "a",
      lhsWidth: undefined,
      rhs: "b",
      rhsWidth: 2,
    }),
    diagnostic("asm.aValueRange", { value: 1234567 }),
    diagnostic("jack.calledAsMethod", { kind: "constructor", name: "A.new" }),
    diagnostic("jack.calledAsMethod", { kind: "task", name: "A.run" }),
  ])("words the variant %j as describeEnglish does", (found) => {
    expect(describeDiagnostic(found)).toBe(describeEnglish(found));
  });
});

describe("describeStatus in English", () => {
  it("leads with the file and its count, then lists each diagnostic", () => {
    const own = diagnostic("chip.wrongName", {});
    const other = diagnostic("chip.notFound", { name: "Foo" }, span);
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
    const only = diagnostic("chip.wrongName", {});
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
