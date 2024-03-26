import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import { cleanup, resetBySuffix } from "../reset.js";
import * as simple_add from "./11_simple_add.js";
import * as stack_test from "./12_stack_test.js";
import * as basic_test from "./21_basic_test.js";
import * as pointer_test from "./22_pointer_test.js";
import * as static_test from "./23_static_test.js";

export const VMS = {
  SimpleAdd: {
    "SimpleAdd.vm": simple_add.vm,
    "SimpleAddVME.tst": simple_add.vm_tst,
    "SimpleAdd.cmp": simple_add.cmp,
    "SimpleAdd.tst": simple_add.hdl_tst,
  },
  StackTest: {
    "StackTest.vm": stack_test.vm,
    "StackTestVME.tst": stack_test.vm_tst,
    "StackTest.cmp": stack_test.cmp,
    "StackTest.tst": stack_test.hdl_tst,
  },
  BasicTest: {
    "BasicTest.vm": basic_test.vm,
    "BasicTestVME.tst": basic_test.vm_tst,
    "BasicTest.cmp": basic_test.cmp,
    "BasicTest.tst": basic_test.hdl_tst,
  },
  PointerTest: {
    "PointerTest.vm": pointer_test.vm,
    "PointerTestVME.tst": pointer_test.vm_tst,
    "PointerTest.cmp": pointer_test.cmp,
    "PointerTest.tst": pointer_test.hdl_tst,
  },
  StaticTest: {
    "StaticTest.vm": static_test.vm,
    "StaticTestVME.tst": static_test.vm_tst,
    "StaticTest.cmp": static_test.cmp,
    "StaticTest.tst": static_test.hdl_tst,
  },
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/7");
  await reset(fs, VMS);
  await fs.popd();
}

export async function resetTests(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/7");
  await resetBySuffix(fs, VMS, ".tst");
  await resetBySuffix(fs, VMS, "VME.tst");
  await resetBySuffix(fs, VMS, ".cmp");
  await fs.popd();
}

export async function cleanupFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/7");
  await cleanup(fs, VMS);
  await fs.popd();
}
