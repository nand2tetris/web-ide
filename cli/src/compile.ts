import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import {
  type Diagnostic,
  describeDiagnostic as describeInEnglish,
} from "@nand2tetris/simulator/languages/diagnostic.js";

export interface JackReport {
  vm: Record<string, string>;
  errors: string[];
}

export function describeDiagnostic(
  className: string,
  found: Diagnostic,
): string {
  const { span } = found;
  // The line number leads the error line, so the text omits its own prefix.
  const text = describeInEnglish({ ...found, span: undefined });
  return span === undefined
    ? `${className}.jack: ${text}`
    : `${className}.jack:${span.line}: ${text}`;
}

export function compileJack(
  files: Record<string, string>,
  options: { attemptRecovery: boolean },
): JackReport {
  const report: JackReport = { vm: {}, errors: [] };
  const compiled = compile(files, options);
  for (const [name, result] of Object.entries(compiled)) {
    if (typeof result === "string") {
      report.vm[name] = result;
    } else {
      report.errors.push(
        ...result.map((diagnostic) => describeDiagnostic(name, diagnostic)),
      );
    }
  }
  return report;
}
