import { Assignments } from "@computron5k/projects/index.js";
import {
  Assignment,
  hasTest,
  runTests,
} from "@computron5k/simulator/projects/runner.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

import {
  NodeFileSystemAdapter,
  splitFile,
} from "./node_file_system_adapter.js";

async function loadAssignment(file: {
  name: string;
  hdl: string;
}): Promise<Assignment> {
  const assignment = Assignments[file.name as keyof typeof Assignments];
  const tst = assignment[
    `${file.name}.tst` as keyof typeof assignment
  ] as string;
  const cmp = assignment[
    `${file.name}.cmp` as keyof typeof assignment
  ] as string;
  return { ...file, tst, cmp };
}

export async function main(root = process.cwd()) {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(root);

  const directory = [...(await fs.readdir("."))];
  const runFiles = directory.filter(
    (file) => file.endsWith(".hdl") || file.endsWith(".tst")
  );

  console.log("Found files", runFiles);

  const files = await Promise.all(
    runFiles
      .map((file) => ({ file, ...splitFile(file) }))
      .filter(hasTest)
      .map(async (file) => {
        const hdl = await fs.readFile(file.file);
        return { ...file, hdl };
      })
  );

  const tests = await runTests(files, loadAssignment, fs);
  for (const test of tests) {
    console.log(`Test ${test.name}: ${test.pass ? "Passed" : "Failed"}`);
  }
}
