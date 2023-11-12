import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import * as simple_add from "./11_simple_add.js";
import * as stack_test from "./12_stack_test.js";
import * as memory_test from "./21_basic_test.js";
import * as pointer_test from "./22_pointer_test.js";
import * as static_test from "./23_static_test.js";

export const VMS = {
  SimpleAdd: {
    "SimpleAdd.vm": simple_add.vm,
    "SimpleAdd.vm_tst": simple_add.vm_tst,
    "SimpleAdd.cmp": simple_add.cmp,
    "SimpleAdd.tst": simple_add.hdl_tst,
  },
  StackTest: {
    "StackTest.vm": stack_test.vm,
    "StackTest.vm_tst": stack_test.vm_tst,
    "StackTest.cmp": stack_test.cmp,
    "StackTest.tst": stack_test.hdl_tst,
  },
  MemoryTest: {
    "MemoryTest.vm": memory_test.vm,
    "MemoryTest.vm_tst": memory_test.vm_tst,
    "MemoryTest.cmp": memory_test.cmp,
    "MemoryTest.tst": memory_test.hdl_tst,
  },
  PointerTest: {
    "PointerTest.vm": pointer_test.vm,
    "PointerTest.vm_tst": pointer_test.vm_tst,
    "PointerTest.cmp": pointer_test.cmp,
    "PointerTest.tst": pointer_test.hdl_tst,
  },
  StaticTest: {
    "StaticTest.vm": static_test.vm,
    "StaticTest.vm_tst": static_test.vm_tst,
    "StaticTest.cmp": static_test.cmp,
    "StaticTest.tst": static_test.hdl_tst,
  },
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/07");
  await reset(fs, VMS);
  await fs.popd();
}
