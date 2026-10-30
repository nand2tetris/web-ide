import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";
import { isValid } from "@nand2tetris/simulator/languages/base.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { compare } from "../compare.js";
import type { DiagnosticStatus, TextStatus } from "./base.context.js";

/**
 * The error status of a file that has diagnostics. An editor marks each
 * diagnostic that has a span, so the status lists only the others; with
 * `marked: false` no editor shows the file and every diagnostic is listed.
 */
export function failureStatus(
  file: string,
  diagnostics: readonly Diagnostic[],
  { marked = true }: { marked?: boolean } = {},
): DiagnosticStatus {
  return {
    severity: "ERROR",
    heading: { file, count: diagnostics.length },
    diagnostics: diagnostics
      .filter(({ span }) => !marked || span === undefined)
      .map((diagnostic) => ({ diagnostic })),
  };
}

/** The status after a test run compares its output to the compare file. */
export function comparisonStatus(
  cmp: string,
  out: string,
): TextStatus | DiagnosticStatus {
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
