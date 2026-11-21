import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { NodeFileSystemAdapter } from "@davidsouther/jiffies/fs_node.ts";
import type { Assignment } from "@nand2tetris/projects/base.js";
import { Assignments } from "@nand2tetris/projects/full.js";
import { RunOptions, runner } from "@nand2tetris/simulator/projects/runner.js";
import { parse } from "path";

/**
 * Load an assignment from the local folder.
 * Uses built in assignments when the local tests are missing.
 */
async function loadAssignment(fs: FileSystem, file: Assignment) {
  const assignment = Assignments[file.name as keyof typeof Assignments];
  const hdl = await fs.readFile(`${file.name}.hdl`);
  const tst = await fs
    .readFile(`${file.name}.tst`)
    .catch(
      () => assignment[`${file.name}.tst` as keyof typeof assignment] as string,
    );
  const cmp = await fs
    .readFile(`${file.name}.cmp`)
    .catch(
      () => assignment[`${file.name}.cmp` as keyof typeof assignment] as string,
    );

  return { ...file, hdl, tst, cmp };
}

export async function testRunner(
  dir: string,
  file: string,
  options: RunOptions = {},
) {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(dir);
  const assignment = await loadAssignment(fs, parse(file));
  const tryRun = runner(fs, undefined, options);
  const run = await tryRun(assignment);
  console.log(run);
}
