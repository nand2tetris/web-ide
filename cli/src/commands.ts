import type { RunOptions } from "@nand2tetris/simulator/projects/runner.js";
import type { CommandModule } from "yargs";
import { attemptRecoveryOption, recoveryOptions } from "./recovery.js";

type Env = Record<string, string | undefined>;

interface GradeArgs {
  directory: string;
  java_ide?: string;
  "attempt-recovery"?: boolean;
}

/** The `grade` command; `grade` receives its arguments and the run options. */
export function gradeCommand(
  grade: (
    directory: string,
    javaIde: string | undefined,
    options: RunOptions,
  ) => void | Promise<void>,
  env: Env,
): CommandModule<object, GradeArgs> {
  return {
    command: "grade [directory]",
    describe: "Grade all NAND2Tetris projects in a directory tree.",
    builder: (yargs) =>
      yargs
        .positional("directory", {
          type: "string",
          default: process.cwd(),
          describe: "Path to a folder to grade for nand2tetris projects.",
        })
        .option("java_ide", {
          type: "string",
          default: process.env.NAND2TETRIS_PATH,
          describe:
            "When set, look for the java IDE jars in this path and compare both runs.",
        })
        .option("attempt-recovery", attemptRecoveryOption),
    handler: (argv) =>
      grade(argv.directory, argv.java_ide, recoveryOptions(argv, env)),
  };
}

interface RunArgs {
  file?: string;
  debug: boolean;
  debug_port: number;
  java_ide?: string;
  "attempt-recovery"?: boolean;
}

/** The `run` command; `run` receives the file and the run options. */
export function runCommand(
  run: (file: string | undefined, options: RunOptions) => void | Promise<void>,
  env: Env,
): CommandModule<object, RunArgs> {
  return {
    command: "run <file>",
    describe:
      "Run a NAND2Tetris file. If the file is .tst, executes the test. If the file is .hdl, starts a terminal session for the chip. If the file is .asm, .hack, .vm, or .jack, loads (possibly after compilation) the file into memory and starts the machine execution.",
    builder: (yargs) =>
      yargs
        .positional("file", {
          type: "string",
          describe: "Path to nand2tetris tst file to execute.",
        })
        .option("debug", {
          type: "boolean",
          default: false,
          describe: "Port for the debugger protocol to listen on.",
        })
        .option("debug_port", {
          type: "number",
          default: 6163,
          describe: "Port for the debugger protocol to listen on.",
        })
        .option("java_ide", {
          type: "string",
          describe:
            "When set, look for the java IDE jars in this path and compare both runs.",
        })
        .option("attempt-recovery", attemptRecoveryOption),
    handler: (argv) => run(argv.file, recoveryOptions(argv, env)),
  };
}
