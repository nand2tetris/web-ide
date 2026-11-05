import {
  DiagnosticCode,
  diagnostic,
  Stage,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import { describe, expect, it, vi } from "vitest";
import { comparisonStatus, failureStatus, statusActions } from "./status.js";

const at = (line: number) => ({ start: 0, end: 1, line });
const bad = (line: number) =>
  diagnostic(DiagnosticCode.Syntax.EXPECTED, { expected: ["bad"] }, at(line));
const nowhere = (name: string) =>
  diagnostic(DiagnosticCode.Chip.NOT_FOUND, { name });

describe("failureStatus", () => {
  it("counts one syntax error", () => {
    expect(failureStatus("hdl", [bad(2)])).toEqual({
      heading: { source: "hdl", count: 1 },
      diagnostics: [],
    });
  });

  it("counts several syntax errors", () => {
    expect(failureStatus("asm", [bad(2), bad(3), bad(5)]).heading).toEqual({
      source: "asm",
      count: 3,
    });
  });

  it("counts the semantic errors apart from syntax errors", () => {
    const semantic = diagnostic(
      DiagnosticCode.Chip.NOT_FOUND,
      { name: "A" },
      at(4),
      Stage.SEMANTIC,
    );
    expect(failureStatus("hdl", [semantic]).heading).toEqual({
      source: "hdl",
      count: 1,
      semantic: 1,
    });
    expect(failureStatus("hdl", [bad(2), semantic]).heading).toEqual({
      source: "hdl",
      count: 2,
      semantic: 1,
    });
  });

  it("lists each diagnostic the editor cannot mark", () => {
    const [marked, first, second] = [bad(2), nowhere("A"), nowhere("B")];
    expect(failureStatus("vm", [marked, first, second])).toEqual({
      heading: { source: "vm", count: 3 },
      diagnostics: [{ diagnostic: first }, { diagnostic: second }],
    });
  });

  it("lists every diagnostic for a file no editor marks", () => {
    const [marked, spanless] = [bad(2), nowhere("A")];
    expect(
      failureStatus("tst", [marked, spanless], { marked: false }).diagnostics,
    ).toEqual([{ diagnostic: marked }, { diagnostic: spanless }]);
  });
});

describe("failureStatus with the head of the list", () => {
  it("lists the first diagnostic ahead of the ones it cannot mark", () => {
    const [first, second, spanless] = [bad(2), bad(3), nowhere("A")];
    expect(
      failureStatus("hdl", [first, second, spanless], { head: true })
        .diagnostics,
    ).toEqual([{ diagnostic: first }, { diagnostic: spanless }]);
  });

  it("lists the first diagnostic once when no editor marks the file", () => {
    const [first, spanless] = [bad(2), nowhere("A")];
    expect(
      failureStatus("tst", [first, spanless], {
        marked: false,
        head: true,
      }).diagnostics,
    ).toEqual([{ diagnostic: first }, { diagnostic: spanless }]);
  });
});

describe("comparisonStatus", () => {
  it("succeeds when the output matches the compare file", () => {
    expect(comparisonStatus("| a |\n| 1 |", "| a |\n| 1 |")).toEqual({
      comparison: "equal",
      severity: "SUCCESS",
    });
  });

  it("fails when the output differs from the compare file", () => {
    expect(comparisonStatus("| a |\n| 1 |", "| a |\n| 0 |")).toEqual({
      comparison: "different",
      severity: "ERROR",
    });
  });

  it("lists the syntax errors of a compare file that does not parse", () => {
    expect(comparisonStatus("| a", "| a |")).toEqual({
      heading: { source: "cmp", count: 1 },
      diagnostics: [
        {
          diagnostic: expect.objectContaining({
            code: DiagnosticCode.Syntax.EXPECTED,
            args: { expected: ['"|"'] },
            span: expect.objectContaining({ line: 1 }),
          }),
        },
      ],
    });
  });
});

describe("statusActions", () => {
  const found = diagnostic(DiagnosticCode.Chip.NOT_FOUND, {
    name: "Unknown chip",
  });
  it("defaults messages to INFO and diagnostics to ERROR", () => {
    const show = vi.fn();
    const actions = statusActions(show);
    actions.setStatus({ message: "Loaded" });
    actions.setFailureStatus("hdl", [found], { marked: false });
    expect(show.mock.calls).toEqual([
      [{ message: "Loaded", severity: "INFO" }],
      [
        {
          heading: { source: "hdl", count: 1 },
          diagnostics: [{ diagnostic: found }],
          severity: "ERROR",
        },
      ],
    ]);
  });
  it("preserves an explicit severity for diagnostics", () => {
    const show = vi.fn();
    statusActions(show).setStatus({
      diagnostics: [{ diagnostic: found }],
      severity: "WARNING",
    });
    expect(show).toHaveBeenCalledWith({
      diagnostics: [{ diagnostic: found }],
      severity: "WARNING",
    });
  });
  it("clears diagnostics and returns to an empty INFO message", () => {
    const show = vi.fn();
    const actions = statusActions(show);
    actions.setFailureStatus("hdl", [found]);
    actions.clearStatus();
    expect(show).toHaveBeenLastCalledWith({ message: "", severity: "INFO" });
  });
});
