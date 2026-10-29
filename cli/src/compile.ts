import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";

/** What compiling a folder of Jack files gives: VM text by class, and error lines. */
export interface JackReport {
  vm: Record<string, string>;
  errors: string[];
}

export const ATTEMPT_RECOVERY_ENV = "NAND2TETRIS_ATTEMPT_RECOVERY";

/** The `--attempt-recovery` option; `--no-attempt-recovery` turns it off. */
export const attemptRecoveryOption = {
  type: "boolean",
  describe: `Keep checking a file after a syntax error, so that later errors are reported too. On by default; --no-attempt-recovery stops at each file's syntax error. Also set by ${ATTEMPT_RECOVERY_ENV}.`,
} as const;

const OFF = new Set(["false", "0", "no", "off"]);

/**
 * Whether to attempt recovery: the flag when given, else the environment
 * variable (`false`, `0`, `no` or `off` turn it off), else on.
 */
export function resolveAttemptRecovery(
  flag: boolean | undefined,
  env: Record<string, string | undefined>,
): boolean {
  if (flag !== undefined) {
    return flag;
  }
  const setting = env[ATTEMPT_RECOVERY_ENV]?.trim().toLowerCase();
  return setting === undefined || !OFF.has(setting);
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
