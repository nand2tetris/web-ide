import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";
import type { DiagnosticStatus } from "./base.context.js";

/** The error status that reports `diagnostics`; the UI words each one. */
export function failureStatus(
  ...diagnostics: readonly Diagnostic[]
): DiagnosticStatus {
  return { severity: "ERROR", diagnostics };
}
