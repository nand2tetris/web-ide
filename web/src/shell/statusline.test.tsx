import { i18n } from "@lingui/core";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import {
  comparisonStatus,
  type Status,
  type StatusSource,
} from "@nand2tetris/components/stores/status.js";
import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { messages } from "../locales";
import StatusLine, { describeStatus } from "./statusline";

const SOURCES = [
  ["asm", "ASM code"],
  ["hdl", "HDL code"],
  ["vm", "VM code"],
  ["tst", "Test script"],
  ["cmp", "Compare file"],
  ["builtin", "Built-in chip"],
] satisfies [StatusSource, string][];

beforeEach(() => i18n.activate("en"));

function failure(source: StatusSource, count: number): Status {
  return { heading: { source, count }, diagnostics: [] };
}

describe("a heading with semantic errors", () => {
  it("names a semantic error, not a syntax error", () => {
    const heading = { source: "hdl", count: 1, semantic: 1 } as const;
    expect(describeStatus({ heading, diagnostics: [] })).toBe(
      "HDL code: 1 semantic error",
    );
  });

  it("names plain errors when syntax and semantic errors mix", () => {
    const heading = { source: "hdl", count: 3, semantic: 1 } as const;
    expect(describeStatus({ heading, diagnostics: [] })).toBe(
      "HDL code: 3 errors",
    );
  });
});

function StatusUnderTest({ status }: { status: Status }) {
  const context = useContext(BaseContext);
  return (
    <BaseContext.Provider
      value={{
        ...context,
        status: { ...status, severity: status.severity ?? "INFO" },
      }}
    >
      <StatusLine />
    </BaseContext.Provider>
  );
}

describe("status wording", () => {
  it.each(SOURCES)(
    "words the %s source and its diagnostic count",
    (source, label) => {
      expect(describeStatus(failure(source, 1))).toBe(
        `${label}: 1 syntax error`,
      );
      expect(describeStatus(failure(source, 3))).toBe(
        `${label}: 3 syntax errors`,
      );
    },
  );

  it.each([
    [
      "| a |\n| 1 |",
      "Simulation successful: The output file is identical to the compare file",
    ],
    [
      "| a |\n| 0 |",
      "Simulation error: The output file differs from the compare file",
    ],
  ])("renders a comparison result for %s", (output, text) => {
    const status = comparisonStatus("| a |\n| 1 |", output);
    render(<StatusUnderTest status={status} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("preserves an ordinary status message", () => {
    expect(describeStatus({ message: "A test script echo" })).toBe(
      "A test script echo",
    );
  });
});

describe("status wording in the pseudolocale", () => {
  beforeEach(() => {
    i18n.load("en-PL", messages["en-PL"]);
    i18n.activate("en-PL");
  });

  it.each(SOURCES)(
    "translates the %s source and both count forms",
    (source, label) => {
      for (const count of [1, 3]) {
        const text = describeStatus(failure(source, count));
        expect(text).not.toContain(label);
        expect(text).not.toContain("syntax error");
        expect(text).toContain(String(count));
      }
    },
  );

  it.each([
    [
      "| a |\n| 1 |",
      "Simulation successful: The output file is identical to the compare file",
    ],
    [
      "| a |\n| 0 |",
      "Simulation error: The output file differs from the compare file",
    ],
  ])("translates the comparison result for %s", (output, english) => {
    const text = describeStatus(comparisonStatus("| a |\n| 1 |", output));
    expect(text).not.toBe(english);
    expect(text).not.toContain("Simulation");
    expect(text).not.toContain("compare file");
  });
});
