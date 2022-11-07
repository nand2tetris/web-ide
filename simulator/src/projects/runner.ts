import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  isOk,
  Ok,
  Err,
  isErr,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { Assignments } from "@computron5k/projects/index.js";
import { HDL, HdlParse } from "../languages/hdl.js";
import { Tst, TST } from "../languages/tst.js";
import { build as buildChip } from "../chip/builder.js";
import { ChipTest } from "../tst.js";
import { ParseError } from "../languages/base.js";
import { Chip } from "../chip/chip.js";

export interface Assignment {
  name: string;
  hdl: string;
  tst: string;
  cmp: string;
}

export interface AssignmentParse extends Assignment {
  maybeParsedHDL: Result<HdlParse, ParseError>;
  maybeParsedTST: Result<Tst, ParseError>;
}

export interface AssignmentBuild extends AssignmentParse {
  maybeChip: Result<Chip, Error>;
  maybeTest: Result<ChipTest, Error>;
}

export interface AssignmentRun extends AssignmentBuild {
  pass: boolean;
  out: string;
}

export const hasTest = ({
  name,
  ext,
}: {
  name: string;
  ext: string;
}): boolean =>
  Assignments[name as keyof typeof Assignments] !== undefined && ext === "hdl";

export const maybeParse = (file: Assignment): AssignmentParse => {
  const maybeParsedHDL = HDL.parse(file.hdl);
  const maybeParsedTST = TST.parse(file.tst);
  return { ...file, maybeParsedHDL, maybeParsedTST };
};

export const maybeBuild = (file: AssignmentParse): AssignmentBuild => {
  const maybeChip = isOk(file.maybeParsedHDL)
    ? buildChip(Ok(file.maybeParsedHDL))
    : Err(new Error("HDL Was not parsed"));
  const maybeTest = isOk(file.maybeParsedTST)
    ? Ok(ChipTest.from(Ok(file.maybeParsedTST)))
    : Err(new Error("TST Was not parsed"));
  return { ...file, maybeChip, maybeTest };
};

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

export const runner = (fs: FileSystem) => {
  const tryRunWithFs = tryRun(fs);
  return async (assignment: Assignment): Promise<AssignmentRun> =>
    tryRunWithFs(await maybeBuild(await maybeParse(assignment)));
};

export function runTests(
  files: Array<{ name: string; hdl: string }>,
  loadAssignment: (file: { name: string; hdl: string }) => Promise<Assignment>,
  fs: FileSystem
): Promise<AssignmentRun[]> {
  const run = runner(fs);
  return Promise.all(
    files.map(loadAssignment).map(async (assignment) => run(await assignment))
  );
}
