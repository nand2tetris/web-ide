import { diagnostic } from "@nand2tetris/simulator/languages/base.js";
import { describe, expect, it } from "vitest";
import { comparisonStatus, failureStatus } from "./status.js";

const at = (line: number) => ({ start: 0, end: 1, line });
const bad = (line: number) =>
  diagnostic("syntax.expected", { expected: ["bad"] }, at(line));
const nowhere = (name: string) => diagnostic("chip.notFound", { name });

describe("failureStatus", () => {
  it("counts one syntax error", () => {
    expect(failureStatus("HDL code", [bad(2)])).toEqual({
      severity: "ERROR",
      heading: { file: "HDL code", count: 1 },
      diagnostics: [],
    });
  });

  it("counts several syntax errors", () => {
    expect(failureStatus("ASM code", [bad(2), bad(3), bad(5)]).heading).toEqual(
      { file: "ASM code", count: 3 },
    );
  });

  it("lists each diagnostic the editor cannot mark", () => {
    const [marked, first, second] = [bad(2), nowhere("A"), nowhere("B")];
    expect(failureStatus("VM code", [marked, first, second])).toEqual({
      severity: "ERROR",
      heading: { file: "VM code", count: 3 },
      diagnostics: [{ diagnostic: first }, { diagnostic: second }],
    });
  });

  it("lists every diagnostic for a file no editor marks", () => {
    const [marked, spanless] = [bad(2), nowhere("A")];
    expect(
      failureStatus("Test script", [marked, spanless], { marked: false })
        .diagnostics,
    ).toEqual([{ diagnostic: marked }, { diagnostic: spanless }]);
  });
});

describe("comparisonStatus", () => {
  it("succeeds when the output matches the compare file", () => {
    expect(comparisonStatus("| a |\n| 1 |", "| a |\n| 1 |")).toEqual({
      message:
        "Simulation successful: The output file is identical to the compare file",
      severity: "SUCCESS",
    });
  });

  it("fails when the output differs from the compare file", () => {
    expect(comparisonStatus("| a |\n| 1 |", "| a |\n| 0 |")).toEqual({
      message:
        "Simulation error: The output file differs from the compare file",
      severity: "ERROR",
    });
  });

  it("lists the syntax errors of a compare file that does not parse", () => {
    expect(comparisonStatus("| a", "| a |")).toEqual({
      severity: "ERROR",
      heading: { file: "Compare file", count: 1 },
      diagnostics: [
        {
          diagnostic: expect.objectContaining({
            code: "syntax.expected",
            args: { expected: ['"|"'] },
            span: expect.objectContaining({ line: 1 }),
          }),
        },
      ],
    });
  });
});
