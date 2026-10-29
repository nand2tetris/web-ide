import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { Err, isErr, isOk, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Assignment,
  AssignmentStubs,
} from "@nand2tetris/projects/base.js";
import type { Runner, RunResult } from "@nand2tetris/runner/types.js";
import { parse as buildChip, type ChipDiagnostics } from "../chip/builder.js";
import { Chip } from "../chip/chip.js";
import { Diagnostics, Valid, validOf } from "../languages/base.js";
import { TST, Tst } from "../languages/tst.js";
import { ChipTest } from "../test/chiptst.js";

export interface AssignmentFiles extends Assignment {
  hdl: string;
  tst: string;
  cmp: string;
}

export interface AssignmentParse extends AssignmentFiles {
  maybeParsedTST: Result<Valid<Tst>, Diagnostics>;
}

export interface AssignmentBuild extends AssignmentParse {
  maybeChip: Result<Chip, Error>;
  maybeTest: Result<ChipTest, Error>;
}

export interface AssignmentRun extends AssignmentBuild {
  pass: boolean;
  out: string;
  shadow?: RunResult;
}

export const hasTest = ({
  name,
  ext,
}: {
  name: string;
  ext: string;
}): boolean =>
  AssignmentStubs[name as keyof typeof AssignmentStubs] !== undefined &&
  [".hdl", ".tst"].includes(ext);

/** Try parsing the loaded test script. */
export const maybeParse = (file: AssignmentFiles): AssignmentParse => {
  const maybeParsedTST = validOf(TST.parse(file.tst));
  return { ...file, maybeParsedTST };
};

/** Every diagnostic of a chip and its dependencies, a line each naming its file. */
function describeFailures(failures: ChipDiagnostics): string {
  return Object.entries(failures)
    .flatMap(([file, diagnostics]) =>
      diagnostics.map(({ message }) => `${file}: ${message}`),
    )
    .join("\n");
}

/** What a run may be told: whether a final call keeps checking after a syntax error (default true). */
export interface RunOptions {
  attemptRecovery?: boolean;
}

/** After parsing the test script, build the Chip from its source, and the Tst. */
export const maybeBuild =
  (fs: FileSystem, options: RunOptions = {}) =>
  async (file: AssignmentParse): Promise<AssignmentBuild> => {
    const built = await buildChip(file.hdl, undefined, undefined, fs, {
      file: `${file.name}.hdl`,
      attemptRecovery: options.attemptRecovery,
    });
    const maybeChip: Result<Chip, Error> = isErr(built)
      ? Err(new Error(describeFailures(Err(built))))
      : built;
    const maybeTest = isOk(file.maybeParsedTST)
      ? ChipTest.from(Ok(file.maybeParsedTST))
      : Err(new Error("TST Was not parsed"));

    return { ...file, maybeChip, maybeTest };
  };

/** If the assignment parsed, run it! */
export const tryRun =
  (fs: FileSystem) =>
  async (assignment: AssignmentBuild): Promise<AssignmentRun> => {
    if (isErr(assignment.maybeChip)) {
      return {
        ...assignment,
        pass: false,
        out: Err(assignment.maybeChip).message,
      };
    }
    if (isErr(assignment.maybeTest)) {
      return {
        ...assignment,
        pass: false,
        out: Err(assignment.maybeTest).message,
      };
    }
    const test = Ok(assignment.maybeTest)
      .with(Ok(assignment.maybeChip))
      .setFileSystem(fs);
    await test.run();
    const out = test.log();
    const pass = out.trim() === assignment.cmp.trim();
    return { ...assignment, out, pass };
  };

/** Parse & execute a Nand2tetris assignment, possibly also including the Java output in shadow mode. */
export const runner = (
  fs: FileSystem,
  ideRunner?: Runner,
  options: RunOptions = {},
) => {
  const tryRunWithFs = tryRun(fs);
  const maybeBuildWithFs = maybeBuild(fs, options);
  return async (assignment: AssignmentFiles): Promise<AssignmentRun> => {
    const jsRunner = async () =>
      tryRunWithFs(await maybeBuildWithFs(await maybeParse(assignment)));
    const javaRunner = async () => ideRunner?.hdl(assignment);

    const [jsRun, shadow] = await Promise.all([jsRunner(), javaRunner()]);
    return { ...jsRun, shadow };
  };
};

/** Run all tests for a given Nand2Tetris project. */
export async function runTests(
  files: Array<Assignment>,
  loadAssignment: (file: Assignment) => Promise<AssignmentFiles>,
  fs: FileSystem,
  ideRunner?: Runner,
  options: RunOptions = {},
): Promise<AssignmentRun[]> {
  const run = runner(fs, ideRunner, options);
  return Promise.all(
    files.map(loadAssignment).map(async (assignment) => run(await assignment)),
  );
}
