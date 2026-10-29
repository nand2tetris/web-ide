import { describe, expect, it } from "vitest";
import yargs from "yargs";
import {
  ATTEMPT_RECOVERY_ENV,
  attemptRecoveryOption,
  recoveryOptions,
  resolveAttemptRecovery,
} from "./recovery.js";

describe("the Attempt Recovery setting", () => {
  const env = (value?: string) => ({ [ATTEMPT_RECOVERY_ENV]: value });

  it("is on when neither the flag nor the environment says otherwise", () => {
    expect(resolveAttemptRecovery(undefined, {})).toBe(true);
    expect(resolveAttemptRecovery(undefined, env(""))).toBe(true);
    expect(resolveAttemptRecovery(undefined, env("true"))).toBe(true);
  });

  it.each(["false", "0", "no", "OFF"])(
    "is off when the environment says %s",
    (value) => {
      expect(resolveAttemptRecovery(undefined, env(value))).toBe(false);
    },
  );

  it.each([
    [["--attempt-recovery"], true],
    [["--no-attempt-recovery"], false],
    [[], undefined],
  ])("reads the flags %j as %s", (args, expected) => {
    const argv = yargs(args)
      .option("attempt-recovery", attemptRecoveryOption)
      .parseSync();

    expect(argv["attempt-recovery"]).toBe(expected);
  });

  it("follows the flag over the environment", () => {
    expect(resolveAttemptRecovery(true, env("false"))).toBe(true);
    expect(resolveAttemptRecovery(false, env("true"))).toBe(false);
  });
});

describe("the run options of a command", () => {
  it("carry the resolved Attempt Recovery value", () => {
    expect(recoveryOptions({}, {})).toEqual({ attemptRecovery: true });
    expect(recoveryOptions({}, { [ATTEMPT_RECOVERY_ENV]: "off" })).toEqual({
      attemptRecovery: false,
    });
    expect(
      recoveryOptions(
        { "attempt-recovery": true },
        { [ATTEMPT_RECOVERY_ENV]: "off" },
      ),
    ).toEqual({ attemptRecovery: true });
  });
});
