/**
 * The TST final call: a test script builds to the test of its target, or to
 * every diagnostic of it, parse first. No test is given with any diagnostic.
 */
import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it, vi } from "vitest";
import { buildTst } from "./builder.js";
import { ChipTest } from "./chiptst.js";
import { CPUTest } from "./cputst.js";
import { VMTest } from "./vmtst.js";

const MISSING_LOAD = "Line 1: A test script must have a load command";

describe("buildTst", () => {
  it("reports a missing block closer and the missing load, parse first, at EOF", () => {
    const source = { name: "Foo.tst", content: "repeat 1 { eval;" };

    const test = buildTst(source, "chip");

    if (!isErr(test)) throw new Error("built a test with diagnostics");
    expect(Err(test)).toEqual([
      {
        message: 'Line 1: expected "}"',
        span: { start: 16, end: 16, line: 1 },
        stage: "parse",
      },
      {
        message: MISSING_LOAD,
        span: { start: 16, end: 16, line: 1 },
        stage: "semantic",
      },
    ]);
  });

  it("leaves only the missing load when the closer is added", () => {
    const source = { name: "Foo.tst", content: "repeat 1 { eval; }" };

    const test = buildTst(source, "chip");

    if (!isErr(test)) throw new Error("built a test with diagnostics");
    expect(Err(test)).toEqual([
      {
        message: MISSING_LOAD,
        span: { start: 18, end: 18, line: 1 },
        stage: "semantic",
      },
    ]);
  });

  it("leaves only the syntax diagnostic when a valid load is added", () => {
    const source = {
      name: "Foo.tst",
      content: "load Foo.hdl;\nrepeat 1 { eval;",
    };

    const test = buildTst(source, "chip");

    if (!isErr(test)) throw new Error("built a test with diagnostics");
    expect(Err(test)).toEqual([
      {
        message: 'Line 2: expected "}"',
        span: { start: 30, end: 30, line: 2 },
        stage: "parse",
      },
    ]);
  });

  it("suppresses the missing load when a skipped command could be the load", () => {
    const source = { name: "Foo.tst", content: "load Foo.hdl ?;\noutput;" };

    const test = buildTst(source, "chip");

    if (!isErr(test)) throw new Error("built a test with diagnostics");
    expect(Err(test)).toHaveLength(1);
    expect(Err(test)[0].stage).toBe("parse");
  });

  it("returns only the strict syntax diagnostic and never builds with recovery off", () => {
    const from = vi.spyOn(ChipTest, "from");
    const source = { name: "Foo.tst", content: "repeat 1 { eval;" };

    const test = buildTst(source, "chip", { attemptRecovery: false });

    if (!isErr(test)) throw new Error("built a test with diagnostics");
    expect(Err(test)).toEqual([
      {
        message: 'Line 1: expected "}"',
        span: { start: 16, end: 16, line: 1 },
        stage: "parse",
      },
    ]);
    expect(from).not.toHaveBeenCalled();
    from.mockRestore();
  });

  it.each([
    ["omitted", undefined, 2],
    ["true", true, 2],
    ["false", false, 1],
  ])(
    "takes recovery %s as its option says",
    (_name, attemptRecovery, count) => {
      const source = { name: "Foo.tst", content: "repeat 1 { eval;" };

      const test = buildTst(source, "vm", { attemptRecovery });

      if (!isErr(test)) throw new Error("built a test with diagnostics");
      expect(Err(test)).toHaveLength(count);
    },
  );

  it("builds the test of each target from a clean script", () => {
    const source = { name: "Foo.tst", content: "load Foo.hdl;\neval;" };

    const chip = buildTst(source, "chip");
    const cpu = buildTst(source, "cpu");
    const vm = buildTst(source, "vm");

    expect(Ok(chip as Ok<ChipTest>)).toBeInstanceOf(ChipTest);
    expect(Ok(cpu as Ok<CPUTest>)).toBeInstanceOf(CPUTest);
    expect(Ok(vm as Ok<VMTest>)).toBeInstanceOf(VMTest);
  });

  it("keeps the CPU target's requireLoad option", () => {
    const source = { name: "Mult.tst", content: "repeat 1 { ticktock; }" };

    const required = buildTst(source, "cpu");
    const optional = buildTst(source, "cpu", { requireLoad: false });

    expect(isErr(required)).toBe(true);
    expect(isErr(optional)).toBe(false);
  });

  it("does not call the load callback while building", () => {
    const loadAction = vi.fn();
    const source = { name: "Foo.tst", content: "load Foo.hdl;\neval;" };

    buildTst(source, "chip", { loadAction });

    expect(loadAction).not.toHaveBeenCalled();
  });
});
