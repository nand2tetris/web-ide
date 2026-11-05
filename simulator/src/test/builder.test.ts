import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it, vi } from "vitest";
import { DiagnosticCode, Stage } from "../languages/diagnostic.js";
import { prune, TST } from "../languages/tst.js";
import { buildTst } from "./builder.js";
import { ChipTest } from "./chiptst.js";
import { CPUTest } from "./cputst.js";
import { VMTest } from "./vmtst.js";

describe("buildTst", () => {
  it("leaves only the missing load when the closer is added", () => {
    const source = { name: "Foo.tst", content: "repeat 1 { eval; }" };

    const test = buildTst(source, "chip");

    if (!isErr(test)) throw new Error("built a test with diagnostics");
    expect(Err(test)).toEqual([
      {
        code: DiagnosticCode.Tst.MISSING_LOAD,
        args: {},
        span: { start: 18, end: 18, line: 1 },
        stage: Stage.SEMANTIC,
      },
    ]);
  });

  it("suppresses the missing load when a skipped command could be the load", () => {
    const source = { name: "Foo.tst", content: "load Foo.hdl ?;\noutput;" };
    const outcome = TST.parse(source.content, { attemptRecovery: true });
    const provenance = prune.provenance(outcome.ast);

    expect("nullRoot" in outcome && outcome.nullRoot).toBe(false);
    expect(provenance).toHaveLength(1);
    expect(provenance[0].kind).toBe("TstOperation");
    expect(provenance[0].diagnostic).toBe(outcome.diagnostics[0]);

    const test = buildTst(source, "chip", { attemptRecovery: true });

    if (!isErr(test)) throw new Error("built a test with diagnostics");
    expect(Err(test)).toHaveLength(1);
    expect(Err(test)[0].stage).toBe(Stage.PARSE);
  });

  it.each([
    ["repeat 1", "load Foo.hdl ?"],
    ["while 1 = 1", "load Foo.hdl"],
  ])(
    "suppresses the missing load after %s discards %s",
    (block, damagedLoad) => {
      const source = {
        name: "Foo.tst",
        content: `${block} { eval; ${damagedLoad} }`,
      };
      const outcome = TST.parse(source.content, { attemptRecovery: true });
      const provenance = prune.provenance(outcome.ast);

      expect("nullRoot" in outcome && outcome.nullRoot).toBe(false);
      expect(provenance).toHaveLength(1);
      const { start, end } = provenance[0].interval;
      expect(source.content.slice(start, end)).toBe(damagedLoad);
      expect(start).toBeLessThan(provenance[0].diagnostic.span?.start ?? -1);
      expect(prune(outcome.ast).lines).toMatchObject([
        { statements: [{ op: { op: "eval" }, separator: ";" }] },
      ]);

      const test = buildTst(source, "chip", { attemptRecovery: true });

      if (!isErr(test)) throw new Error("built a test with diagnostics");
      expect(Err(test)).toHaveLength(1);
      expect(Err(test)[0].stage).toBe(Stage.PARSE);
      expect(provenance[0].kind).toBe("TstOperation");
      expect(
        isErr(
          buildTst(
            { ...source, content: `${block} { eval; load Foo.hdl; }` },
            "chip",
            { attemptRecovery: true },
          ),
        ),
      ).toBe(false);
    },
  );

  it.each([
    ["repeat 1", "eval; ?", "TstRepeatClose"],
    ["while 1 = 1", "", "TstWhileClose"],
  ])(
    "keeps an independent missing load when %s contains %j",
    (block, body, kind) => {
      const source = { name: "Foo.tst", content: `${block} { ${body} }` };
      const outcome = TST.parse(source.content, { attemptRecovery: true });
      const provenance = prune.provenance(outcome.ast);

      expect(provenance).toHaveLength(1);
      expect(provenance[0].kind).toBe(kind);
      const { start, end } = provenance[0].interval;
      expect(source.content.slice(start, end)).toBe(body ? "?" : "");
      expect(provenance[0].interval.start).toBe(
        provenance[0].diagnostic.span?.start,
      );

      const test = buildTst(source, "chip", { attemptRecovery: true });

      if (!isErr(test)) throw new Error("built a test with diagnostics");
      expect(Err(test)).toHaveLength(2);
      expect(Err(test)[0].stage).toBe(Stage.PARSE);
      expect(Err(test)[1]).toEqual({
        code: DiagnosticCode.Tst.MISSING_LOAD,
        args: {},
        span: {
          start: source.content.length,
          end: source.content.length,
          line: 1,
        },
        stage: Stage.SEMANTIC,
      });
    },
  );

  it("withholds semantic checks when no closer can be joined, with recovery on or off", () => {
    const from = vi.spyOn(ChipTest, "from");
    const source = { name: "Foo.tst", content: "repeat 1 { eval;" };
    for (const attemptRecovery of [true, false]) {
      const outcome = TST.parse(source.content, { attemptRecovery });
      expect(outcome).toHaveProperty("nullRoot", true);
      const test = buildTst(source, "chip", { attemptRecovery });
      if (!isErr(test)) throw new Error("built a test with diagnostics");
      expect(Err(test)).toEqual([
        {
          code: DiagnosticCode.Syntax.EXPECTED,
          args: { expected: ['"}"'] },
          span: { start: 16, end: 16, line: 1 },
          stage: Stage.PARSE,
        },
      ]);
    }
    expect(from).not.toHaveBeenCalled();
    from.mockRestore();
  });

  it("is strict unless recovery is explicitly enabled", () => {
    const source = { name: "Foo.tst", content: "repeat 1 { eval; ? }" };
    const strict = buildTst(source, "vm");
    const disabled = buildTst(source, "vm", { attemptRecovery: false });
    const enabled = buildTst(source, "vm", { attemptRecovery: true });
    if (!isErr(strict) || !isErr(disabled) || !isErr(enabled))
      throw new Error("built a test with diagnostics");
    expect(Err(strict)).toEqual(Err(disabled));
    expect(Err(strict)).toHaveLength(1);
    expect(Err(enabled).map(({ stage }) => stage)).toEqual([
      Stage.PARSE,
      Stage.SEMANTIC,
    ]);
  });

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
