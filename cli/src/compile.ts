import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";

/** What compiling a folder of Jack files gives: VM text by class, and error lines. */
export interface JackReport {
  vm: Record<string, string>;
  errors: string[];
}

/** One diagnostic of a Jack file as an error line, such as `Main.jack:7: Undeclared variable y`. */
export function describeDiagnostic(
  className: string,
  { message, span }: Diagnostic,
): string {
  const text = message.replace(/^Line \d+: /, "");
  return span === undefined
    ? `${className}.jack: ${text}`
    : `${className}.jack:${span.line}: ${text}`;
}

/** Compiles Jack files by class name, listing each file's diagnostics in order. */
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
