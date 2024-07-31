import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { VM_PROJECTS } from "@nand2tetris/projects/base.js";
import { resetFiles } from "@nand2tetris/projects/full.js";
import { TST } from "../languages/tst.js";
import { VMTest } from "./vmtst.js";

async function prepare(project: "07" | "08", name: string): Promise<VMTest> {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  await resetFiles(fs);
  fs.cd(`/projects/${project}/${name}`);
  const vm_tst = await fs.readFile(name + "VME.tst");
  const tst = unwrap(TST.parse(vm_tst));
  const test = unwrap(VMTest.from(tst)).using(fs);
  await test.load();
  return test;
}

describe("VM Test Runner", () => {
  test.each(VM_PROJECTS["07"])("07 VM Test Runner %s", async (name) => {
    const test = await prepare("07", name);

    for (let i = 0; i < 100; i++) {
      await test.step();
    }
  });

  test.each(VM_PROJECTS["08"])("08 VM Test Runner %s", async (name) => {
    const test = await prepare("08", name);

    for (let i = 0; i < 100; i++) {
      test.step();
    }
  });
});
