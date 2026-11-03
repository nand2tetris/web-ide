import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";
import { isValid } from "@nand2tetris/simulator/languages/base.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { compare } from "../compare.js";
import type { StatusSeverity } from "./base.context.js";

export interface Status {
  message: string;
  severity: StatusSeverity;
}

/**
 * The error status of a file that has diagnostics, such as "HDL code: 2
 * syntax errors". An editor marks each diagnostic with a span, so the status adds
 * only the messages it cannot mark. With `marked: false`, no editor shows the
 * file, and the status adds every message. With `head`, the status also adds
 * the first diagnostic of the list, the earliest when the list is sorted.
 */
export function failureStatus(
  file: string,
  diagnostics: readonly Diagnostic[],
  { marked = true, head = false }: { marked?: boolean; head?: boolean } = {},
): Status {
  const count =
    diagnostics.length === 1
      ? "1 syntax error"
      : `${diagnostics.length} syntax errors`;
  const unmarked = diagnostics
    .filter(({ span }) => !marked || span === undefined)
    .map(({ message }) => message);
  const [first] = diagnostics;
  const shown =
    head && first !== undefined && !unmarked.includes(first.message)
      ? [first.message, ...unmarked]
      : unmarked;
  return {
    message: [`${file}: ${count}`, ...shown].join(". "),
    severity: "ERROR",
  };
}

/** The status after a test run compares its output to the compare file. */
export function comparisonStatus(cmp: string, out: string): Status {
  const parsed = CMP.parse(cmp);
  if (!isValid(parsed)) {
    return failureStatus("Compare file", parsed.diagnostics, { marked: false });
  }
  return compare(cmp, out)
    ? {
        message: `Simulation successful: The output file is identical to the compare file`,
        severity: "SUCCESS",
      }
    : {
        message: `Simulation error: The output file differs from the compare file`,
        severity: "ERROR",
      };
}
