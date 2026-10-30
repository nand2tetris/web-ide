import type { RunOptions } from "@nand2tetris/simulator/projects/runner.js";

export const ATTEMPT_RECOVERY_ENV = "NAND2TETRIS_ATTEMPT_RECOVERY";

export const attemptRecoveryOption = {
  type: "boolean",
  describe: `Keep checking a file after a syntax error, so that later errors are reported too. Off by default; --attempt-recovery reports later diagnostics too. Also set by ${ATTEMPT_RECOVERY_ENV}.`,
} as const;

const ON = new Set(["true", "1", "yes", "on"]);

/**
 * Whether to attempt recovery: the flag when given, else the environment
 * variable (`true`, `1`, `yes` or `on` enable it), else off.
 */
export function resolveAttemptRecovery(
  flag: boolean | undefined,
  env: Record<string, string | undefined>,
): boolean {
  if (flag !== undefined) {
    return flag;
  }
  const setting = env[ATTEMPT_RECOVERY_ENV]?.trim().toLowerCase();
  return setting !== undefined && ON.has(setting);
}

export function recoveryOptions(
  argv: { "attempt-recovery"?: boolean },
  env: Record<string, string | undefined>,
): RunOptions {
  return {
    attemptRecovery: resolveAttemptRecovery(argv["attempt-recovery"], env),
  };
}
