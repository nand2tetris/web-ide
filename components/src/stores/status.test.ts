import { describe, expect, it } from "vitest";
import { comparisonStatus, failureStatus } from "./status.js";

const at = (line: number) => ({ start: 0, end: 1, line });

describe("failureStatus", () => {
  it("counts one syntax error", () => {
    expect(
      failureStatus("HDL code", [{ message: "Line 2: bad", span: at(2) }]),
    ).toEqual({ message: "HDL code: 1 syntax error", severity: "ERROR" });
  });

  it("counts several syntax errors", () => {
    expect(
      failureStatus("ASM code", [
        { message: "Line 2: bad", span: at(2) },
        { message: "Line 3: bad", span: at(3) },
        { message: "Line 5: bad", span: at(5) },
      ]).message,
    ).toBe("ASM code: 3 syntax errors");
  });

  it("adds each message the editor cannot mark", () => {
    expect(
      failureStatus("VM code", [
        { message: "Line 2: bad", span: at(2) },
        { message: "Function Main.main not found" },
        { message: "Stack is empty" },
      ]).message,
    ).toBe(
      "VM code: 3 syntax errors. Function Main.main not found. Stack is empty",
    );
  });

  it("adds every message for a file no editor marks", () => {
    expect(
      failureStatus(
        "Test script",
        [{ message: "Line 2: bad", span: at(2) }, { message: "No location" }],
        { marked: false },
      ).message,
    ).toBe("Test script: 2 syntax errors. Line 2: bad. No location");
  });
});

describe("failureStatus with the head of the list", () => {
  it("adds the first diagnostic ahead of the messages it cannot mark", () => {
    expect(
      failureStatus(
        "HDL code",
        [
          { message: "Line 2: bad", span: at(2) },
          { message: "Line 3: worse", span: at(3) },
          { message: "No location" },
        ],
        { head: true },
      ).message,
    ).toBe("HDL code: 3 syntax errors. Line 2: bad. No location");
  });

  it("names the first diagnostic once when no editor marks the file", () => {
    expect(
      failureStatus(
        "Test script",
        [{ message: "Line 2: bad", span: at(2) }, { message: "No location" }],
        { marked: false, head: true },
      ).message,
    ).toBe("Test script: 2 syntax errors. Line 2: bad. No location");
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

  it("reports the syntax errors of a compare file that does not parse", () => {
    expect(comparisonStatus("| a", "| a |")).toEqual({
      message: 'Compare file: 1 syntax error. Line 1: expected "|"',
      severity: "ERROR",
    });
  });
});
