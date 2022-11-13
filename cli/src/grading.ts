import { Assignment, Assignments } from "@computron5k/projects/index.js";
import {
  AssignmentFiles,
  hasTest,
  runTests,
} from "@computron5k/simulator/projects/runner.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { join, parse } from "path";

import { NodeFileSystemAdapter } from "./node_file_system_adapter.js";

const loadAssignment = (fs: FileSystem) =>
  async function (file: Assignment): Promise<AssignmentFiles> {
    const assignment = Assignments[file.name as keyof typeof Assignments];
    const hdl = await fs.readFile(file.base);
    const tst = assignment[
      `${file.name}.tst` as keyof typeof assignment
    ] as string;
    const cmp = assignment[
      `${file.name}.cmp` as keyof typeof assignment
    ] as string;
    return { ...file, hdl, tst, cmp };
  };

export async function main(folder = process.cwd(), java_ide = "") {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(folder);

  const directory = [...(await fs.readdir("."))];
  const runFiles = directory.filter((file) => file.endsWith(".hdl"));

  const files = runFiles
    .map((f) => join(folder, f))
    .map(parse)
    .filter(hasTest);

  const tests = await runTests(files, loadAssignment(fs), fs, java_ide);
  for (const test of tests) {
    console.log(
      `Test ${test.name}: ${test.pass ? `Passed` : `Failed (${test.out})`}`
    );
    if (test.shadow) {
      console.log(
        `\tShadow: ${
          test.shadow.code === 0
            ? `Passed`
            : `Errored (${test.shadow.stderr.trim()})`
        }`
      );
    } else {
      console.log("\tNo shadow");
    }
  }
}
