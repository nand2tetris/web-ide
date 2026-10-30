import {
  DiagnosticCode,
  diagnostic,
} from "@nand2tetris/simulator/languages/diagnostic.js";
import { describe, expect, it } from "vitest";
import { failureStatus } from "./status.js";

describe("failureStatus", () => {
  it("holds the diagnostics as data and leaves the severity to setStatus", () => {
    const found = diagnostic(DiagnosticCode.Chip.NOT_FOUND, { name: "Nope" });

    expect(failureStatus(found)).toEqual({
      diagnostics: [found],
    });
  });
});
