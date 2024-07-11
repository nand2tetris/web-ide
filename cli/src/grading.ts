import type { Assignment } from "@nand2tetris/projects/base.js";
import { Assignments } from "@nand2tetris/projects/full.js";
import { JavaRunner } from "@nand2tetris/runner/index.js";
import {
  AssignmentFiles,
  hasTest,
  runTests,
} from "@nand2tetris/simulator/projects/runner.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { join, parse } from "path";

import { NodeFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs_node.js";

/**
 * Given a FileSystem wrapper, curry a function that loads the necessary files for running an HDL test.
 * For grading, tests come from the built-in assignment master test list.
 */
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

/**
 * Run the grader using a NodeJS file system.
 *
 * Report results using a simple `{Name} passed/failed`, and if given a java_id, the same for shadow mode results.
 *
 * Returns 1 if at least one test was failed or no tests were found to run. Returns 0 otherwise.
 */
export async function main(folder = process.cwd(), java_ide = "") {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(folder);

  const directory = [...(await fs.readdir("."))];
  const runFiles = directory.filter((file) => file.endsWith(".hdl"));

  const files = runFiles
    .map((f) => join(folder, f))
    .map(parse)
    .filter(hasTest);

  const ideRunner = await JavaRunner.try_init(java_ide);
  const tests = await runTests(files, loadAssignment(fs), fs, ideRunner);

  if (!tests.length) {
    console.log('No tests have run!');
    return 1;
  }
  let failsCount = 0;
  for (const test of tests) {
    if(!test.pass) {
      failsCount++;
    }
    console.log(
      `Test ${test.name}: ${test.pass ? `Passed` : `Failed (${test.out})`}`,
    );
    if (test.shadow) {
      if(test.shadow.code !== 0){
        failsCount++;
      }
      console.log(
        `\tShadow: ${
          test.shadow.code === 0
            ? `Passed`
            : `Errored (${test.shadow.stderr.trim()})`
        }`,
      );
    } else {
      console.log("\tNo shadow");
    }
  }
  return failsCount > 0 ? 1 : 0;
}
