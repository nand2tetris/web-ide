import type { RunOptions } from "@nand2tetris/simulator/projects/runner.js";

export const ATTEMPT_RECOVERY_ENV = "NAND2TETRIS_ATTEMPT_RECOVERY";

/** The `--attempt-recovery` option of every command that calls a final call; `--no-attempt-recovery` turns it off. */
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

/** The run options a command's parsed `--attempt-recovery` flag and the environment give. */
export function recoveryOptions(
  argv: { "attempt-recovery"?: boolean },
  env: Record<string, string | undefined>,
): RunOptions {
  return {
    attemptRecovery: resolveAttemptRecovery(argv["attempt-recovery"], env),
  };
}
