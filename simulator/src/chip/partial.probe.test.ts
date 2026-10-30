/**
 * A chip with one broken part goes through the production parse entry point.
 * A recovered tree pruned to its clean parts is accepted by `build` as
 * `Valid<HdlParse>`, and an unpruned tree is a type error.
 */
import { unwrap } from "@davidsouther/jiffies/result.ts";
import { describe, expect, it } from "vitest";
import { isRecovered, isValid, recoveryOf } from "../languages/base.js";
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

const RECOVER = { attemptRecovery: true };

describe("partial AST probe", () => {
  it("simulates the parts that recovered cleanly", async () => {
    const outcome = HDL.parse(PROBE, RECOVER);
    expect(isValid(outcome)).toBe(false);
    expect(outcome.ast).not.toEqual(HDL.empty());
    expect(outcome.diagnostics).toMatchObject([
      {
        code: "syntax.expected",
        args: { expected: ['")"', '","', '"["'] },
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
    const outcome = HDL.parse(PROBE, RECOVER);
    // Never called: the compile time check is the assertion.
    const _unchecked = () =>
      // @ts-expect-error a tree beside diagnostics is not `Valid<HdlParse>`
      build({ parts: outcome.ast, name: "Probe" });
    const _checked = () =>
      isValid(outcome) ? build({ parts: outcome.ast, name: "Probe" }) : null;
    expect(isValid(outcome)).toBe(false);
  });
});
