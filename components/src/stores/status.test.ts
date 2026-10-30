import { diagnostic } from "@nand2tetris/simulator/languages/base.js";
import { describe, expect, it } from "vitest";
import { failureStatus } from "./status.js";

describe("failureStatus", () => {
  it("is an error status holding the diagnostics as data", () => {
    const found = diagnostic("chip.notFound", { name: "Nope" });

    expect(failureStatus(found)).toEqual({
      severity: "ERROR",
      diagnostics: [found],
    });
  });
});
