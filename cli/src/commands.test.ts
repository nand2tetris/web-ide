import type { RunOptions } from "@nand2tetris/simulator/projects/runner.js";
import { describe, expect, it } from "vitest";
import yargs, { type CommandModule } from "yargs";
import { gradeCommand, runCommand } from "./commands.js";
import { ATTEMPT_RECOVERY_ENV } from "./recovery.js";

type Env = Record<string, string | undefined>;

/** Each command that calls a final call, built to hand its run options to `receive`. */
const commands: Array<
  [
    string,
    string[],
    (receive: (options: RunOptions) => void, env: Env) => CommandModule,
  ]
> = [
  [
    "grade",
    ["grade", "somewhere"],
    (receive, env) =>
      gradeCommand(
        (_directory, _ide, options) => receive(options),
        env,
      ) as unknown as CommandModule,
  ],
  [
    "run",
    ["run", "Not.tst"],
    (receive, env) =>
      runCommand(
        (_file, options) => receive(options),
        env,
      ) as unknown as CommandModule,
  ],
];

describe.each(commands)("the %s command", (_name, base, command) => {
  /** Parse `args` as the CLI would, and give the run options the command's action received. */
  async function optionsOf(args: string[], env: Env = {}): Promise<RunOptions> {
    let received: RunOptions | undefined;
    await yargs([...base, ...args])
      .command(command((options) => (received = options), env))
      .parseAsync();
    if (received === undefined) {
      expect.unreachable("the command's action should run");
    }
    return received;
  }

  it("attempts recovery by default", async () => {
    expect(await optionsOf([])).toEqual({ attemptRecovery: true });
  });

  it("turns recovery off by --no-attempt-recovery", async () => {
    expect(await optionsOf(["--no-attempt-recovery"])).toEqual({
      attemptRecovery: false,
    });
  });

  it("turns recovery off by the environment variable", async () => {
    expect(await optionsOf([], { [ATTEMPT_RECOVERY_ENV]: "off" })).toEqual({
      attemptRecovery: false,
    });
  });

  it("follows --attempt-recovery over an environment variable that turns it off", async () => {
    expect(
      await optionsOf(["--attempt-recovery"], { [ATTEMPT_RECOVERY_ENV]: "0" }),
    ).toEqual({ attemptRecovery: true });
  });

  it("follows --no-attempt-recovery over an environment variable that turns it on", async () => {
    expect(
      await optionsOf(["--no-attempt-recovery"], {
        [ATTEMPT_RECOVERY_ENV]: "true",
      }),
    ).toEqual({ attemptRecovery: false });
  });

  it("describes --attempt-recovery in its help", async () => {
    const help = await yargs([base[0], "--help"])
      .command(command(() => undefined, {}))
      .exitProcess(false)
      .getHelp();

    expect(help).toContain("--attempt-recovery");
    expect(help).toContain(ATTEMPT_RECOVERY_ENV);
  });
});
