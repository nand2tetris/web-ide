import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";
import { describe, expect, it, vi } from "vitest";
import { failureStatus, statusActions } from "./status.js";

const diagnostic: Diagnostic = {
  message: "Unknown chip",
  span: { start: 0, end: 4, line: 1 },
};

describe("failureStatus", () => {
  it("holds the diagnostics as data and leaves the severity to setStatus", () => {
    expect(failureStatus(diagnostic)).toEqual({ diagnostics: [diagnostic] });
  });
});

describe("statusActions", () => {
  it("defaults messages to INFO and diagnostics to ERROR", () => {
    const show = vi.fn();
    const actions = statusActions(show);

    actions.setStatus({ message: "Loaded" });
    actions.setFailureStatus(diagnostic);

    expect(show.mock.calls).toEqual([
      [{ message: "Loaded", severity: "INFO" }],
      [{ diagnostics: [diagnostic], severity: "ERROR" }],
    ]);
  });

  it("preserves an explicit severity for diagnostics", () => {
    const show = vi.fn();
    const actions = statusActions(show);

    actions.setStatus({ diagnostics: [diagnostic], severity: "WARNING" });

    expect(show).toHaveBeenCalledWith({
      diagnostics: [diagnostic],
      severity: "WARNING",
    });
  });

  it("clears diagnostics and returns to an empty INFO message", () => {
    const show = vi.fn();
    const actions = statusActions(show);

    actions.setFailureStatus(diagnostic);
    actions.clearStatus();

    expect(show).toHaveBeenLastCalledWith({ message: "", severity: "INFO" });
  });
});
