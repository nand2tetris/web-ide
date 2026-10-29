/**
 * Planned partial AST consumer: simulate a chip with one broken part through
 * the production parse entry point. The recovered tree is pruned to its clean
 * parts, which `build` accepts as `Valid<HdlParse>`.
 */
import { unwrap } from "@davidsouther/jiffies/result.ts";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  isParserRecoveryEnabled,
  isRecovered,
  isValid,
  recoveryOf,
  setParserRecovery,
} from "../languages/base.js";
import { HDL, prune } from "../languages/hdl.js";
import { build } from "./builder.js";
import { HIGH, LOW } from "./chip.js";

const PROBE = [
  "CHIP Probe {",
  "    IN a, b;",
  "    OUT x, y;",
  "    PARTS:",
  "    Not(in=a, out=x);",
  "    And(a=a b=b, out=y);",
  "}",
].join("\n");

describe("partial AST probe", () => {
  let before = false;
  beforeEach(() => {
    before = isParserRecoveryEnabled();
    setParserRecovery(true);
  });
  afterEach(() => setParserRecovery(before));

  it("simulates the parts that recovered cleanly", async () => {
    const outcome = HDL.parse(PROBE);
    expect(isValid(outcome)).toBe(false);
    expect(outcome.ast).not.toEqual(HDL.empty());
    expect(outcome.diagnostics).toMatchObject([
      {
        message: 'Line 6: expected ")", ",", or "["',
        span: { start: 85, end: 85, line: 6 },
      },
    ]);

    // The broken part is a null `Part` whose diagnostic is the outcome's own.
    const { ast } = outcome;
    const parts = ast.parts === "BUILTIN" ? [] : ast.parts;
    const broken = parts.filter(isRecovered);
    expect(broken).toHaveLength(1);
    expect(recoveryOf(broken[0])).toBe(outcome.diagnostics[0]);

    const chip = unwrap(await build({ parts: prune(ast), name: "Probe" }));

    chip.in("a").pull(LOW);
    chip.eval();
    expect(chip.out("x").busVoltage).toBe(HIGH);
    chip.in("a").pull(HIGH);
    chip.eval();
    expect(chip.out("x").busVoltage).toBe(LOW);
  });

  it("refuses at compile time a tree not known to be valid", () => {
    const outcome = HDL.parse(PROBE);
    // Never called: the compile time check is the assertion.
    const _unchecked = () =>
      // @ts-expect-error a tree beside diagnostics is not `Valid<HdlParse>`
      build({ parts: outcome.ast, name: "Probe" });
    const _checked = () =>
      isValid(outcome) ? build({ parts: outcome.ast, name: "Probe" }) : null;
    expect(isValid(outcome)).toBe(false);
  });
});
