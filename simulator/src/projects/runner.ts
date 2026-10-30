import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { Err, isErr, isOk, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  type Assignment,
  AssignmentStubs,
} from "@nand2tetris/projects/base.js";
import type { Runner, RunResult } from "@nand2tetris/runner/types.js";
import { build as buildChip } from "../chip/builder.js";
import { Chip } from "../chip/chip.js";
import { Diagnostic, describeEnglish } from "../languages/base.js";
import { HDL, HdlParse } from "../languages/hdl.js";
import { TST, Tst } from "../languages/tst.js";
import { ChipTest } from "../test/chiptst.js";

export interface AssignmentFiles extends Assignment {
  hdl: string;
  tst: string;
  cmp: string;
}

export interface AssignmentParse extends AssignmentFiles {
  maybeParsedHDL: Result<HdlParse, Diagnostic>;
  maybeParsedTST: Result<Tst, Diagnostic>;
}

export interface AssignmentBuild extends AssignmentParse {
  maybeChip: Result<Chip, Diagnostic>;
  maybeTest: Result<ChipTest, Diagnostic>;
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

/** Try parsing the loaded files. */
export const maybeParse = (file: AssignmentFiles): AssignmentParse => {
  const maybeParsedHDL = HDL.parse(file.hdl);
  const maybeParsedTST = TST.parse(file.tst);
  return { ...file, maybeParsedHDL, maybeParsedTST };
};

/** After parsing the assignment, compile the Chip and Tst. */
export const maybeBuild =
  (fs: FileSystem) =>
  async (file: AssignmentParse): Promise<AssignmentBuild> => {
    const maybeChip: Result<Chip, Diagnostic> = isOk(file.maybeParsedHDL)
      ? await buildChip({ parts: Ok(file.maybeParsedHDL), fs })
      : file.maybeParsedHDL;
    const maybeTest: Result<ChipTest, Diagnostic> = isOk(file.maybeParsedTST)
      ? ChipTest.from(Ok(file.maybeParsedTST))
      : file.maybeParsedTST;

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
        out: describeEnglish(Err(assignment.maybeChip)),
      };
    }
    if (isErr(assignment.maybeTest)) {
      return {
        ...assignment,
        pass: false,
        out: describeEnglish(Err(assignment.maybeTest)),
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
export const runner = (fs: FileSystem, ideRunner?: Runner) => {
  const tryRunWithFs = tryRun(fs);
  const maybeBuildWithFs = maybeBuild(fs);
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
): Promise<AssignmentRun[]> {
  const run = runner(fs, ideRunner);
  return Promise.all(
    files.map(loadAssignment).map(async (assignment) => run(await assignment)),
  );
}
