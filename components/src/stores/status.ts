import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";
import { isValid } from "@nand2tetris/simulator/languages/base.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { compare } from "../compare.js";
import type {
  DiagnosticStatus,
  StatusDiagnostic,
  TextStatus,
} from "./base.context.js";

/**
 * The error status of a file that has diagnostics. An editor marks each
 * diagnostic that has a span, so the status lists only the others; with
 * `marked: false` no editor shows the file and every diagnostic is listed.
 * `head` also lists the first diagnostic. `others` holds diagnostics of other
 * files by path; no editor marks them, so they are all listed and counted.
 */
export function failureStatus(
  file: string,
  diagnostics: readonly Diagnostic[],
  {
    marked = true,
    head = false,
    others = {},
  }: {
    marked?: boolean;
    head?: boolean;
    others?: Record<string, readonly Diagnostic[]>;
  } = {},
): DiagnosticStatus {
  const unmarked: StatusDiagnostic[] = [
    ...diagnostics
      .filter(({ span }) => !marked || span === undefined)
      .map((diagnostic) => ({ diagnostic })),
    ...Object.entries(others).flatMap(([path, list]) =>
      list.map((diagnostic) => ({ diagnostic, file: path })),
    ),
  ];
  const [first = Object.values(others).flat()[0]] = diagnostics;
  const listed =
    head &&
    first !== undefined &&
    !unmarked.some(({ diagnostic }) => diagnostic === first)
      ? [{ diagnostic: first }, ...unmarked]
      : unmarked;
  const count =
    diagnostics.length +
    Object.values(others).reduce((sum, list) => sum + list.length, 0);
  return {
    severity: "ERROR",
    heading: { file, count },
    diagnostics: listed,
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
