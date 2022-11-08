import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { NodeFileSystemAdapter } from "./node_file_system_adapter.js";
import { runner } from "@computron5k/simulator/projects/runner.js";
import { Assignments } from "@computron5k/projects/index.js";

async function loadAssignment(
  fs: FileSystem,
  file: { name: string; hdl: string }
) {
  const assignment = Assignments[file.name as keyof typeof Assignments];
  const tst = await fs
    .readFile(`${file.name}.tst`)
    .catch(
      () => assignment[`${file.name}.tst` as keyof typeof assignment] as string
    );
  const cmp = await fs
    .readFile(`${file.name}.cmp`)
    .catch(
      () => assignment[`${file.name}.cmp` as keyof typeof assignment] as string
    );

  return { ...file, tst, cmp };
}

export async function testRunner(root: string, name: string) {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(root);
  const tryRun = runner(fs);
  const file = { name, hdl: await fs.readFile(`${name}.hdl`) };
  const assignment = await loadAssignment(fs, file);
  const run = await tryRun(assignment);
  console.log(run);
}

export async function testDebugger(root: string, name: string, port: number) {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(root);
  const file = { name, hdl: await fs.readFile(`${name}.hdl`) };
  const assignment = await loadAssignment(fs, file);
}
