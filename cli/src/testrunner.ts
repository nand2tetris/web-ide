import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { NodeFileSystemAdapter } from "@davidsouther/jiffies/lib/esm/fs_node.js";
import { runner } from "@nand2tetris/simulator/projects/runner.js";
import { Assignments } from "@nand2tetris/projects/full.js";
import type { Assignment } from "@nand2tetris/projects/base.js";
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

/**
 * Load an assignment using a provided tst string instead of reading from disk.
 */
async function loadAssignmentFromSource(
  fs: FileSystem,
  file: Assignment,
  tst: string,
) {
  const assignment = Assignments[file.name as keyof typeof Assignments];
  const hdl = await fs.readFile(`${file.name}.hdl`);
  const cmp = await fs
    .readFile(`${file.name}.cmp`)
    .catch(
      () => assignment[`${file.name}.cmp` as keyof typeof assignment] as string,
    );
  return { ...file, hdl, tst, cmp };
}

/**
 * Run a nand2tetris.tst file.
 */
export async function testRunner(dir: string, file: string) {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(dir);
  const assignment = await loadAssignment(fs, parse(file));
  const tryRun = runner(fs);
  const run = await tryRun(assignment);
  console.log(run);
}

/**
 * Run a chip HDL using a tst script passed as a string via stdin.
 */
export async function testRunnerFromSource(
  dir: string,
  file: string,
  tst: string,
) {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(dir);
  const assignment = await loadAssignmentFromSource(fs, parse(file), tst);
  const tryRun = runner(fs);
  const run = await tryRun(assignment);
  console.log(run);
}

// export async function testDebugger(root: string, name: string, port: number) {}
