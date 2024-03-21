import { VM_PROJECTS, resetFiles } from "@nand2tetris/projects/index.js";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { TST } from "../languages/tst.js";
import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { VMTest } from "./vmtst.js";

async function prepare(project: "7" | "8", name: string): Promise<VMTest> {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  await resetFiles(fs);
  fs.cd(`/projects/${project}/${name}`);
  const vm_tst = await fs.readFile(name + "VME.tst");
  const tst = unwrap(TST.parse(vm_tst));
  const test = VMTest.from(tst).using(fs);
  await test.load();
  return test;
}

describe("VM Test Runner", () => {
  test.each(VM_PROJECTS["7"])("7 VM Test Runner %s", async (name) => {
    const test = await prepare("7", name);

    for (let i = 0; i < 100; i++) {
      await test.step();
    }
  });

  test.each(VM_PROJECTS["8"])("8 VM Test Runner %s", async (name) => {
    const test = await prepare("8", name);

    for (let i = 0; i < 100; i++) {
      test.step();
    }
  });
});
