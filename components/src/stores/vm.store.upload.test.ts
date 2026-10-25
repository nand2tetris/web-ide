import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { expect, test, vi } from "vitest";
import { makeVmStore, VmStoreDispatch } from "./vm.store.js";

// #673: a VME .tst uploaded from disk reaches the store as a bare basename, so
// a bare `load,` scanned "" instead of the VM files the user already loaded.
const VM_FILES = [
  { name: "Main", content: "function Main.main 0\npush constant 7\nreturn\n" },
];

function vmHarness(fs = new FileSystem(new ObjectFileSystemAdapter({}))) {
  const statuses: string[] = [];
  const { actions } = makeVmStore(
    fs,
    (s) => statuses.push(typeof s === "string" ? s : s.message),
    {},
    { current: vi.fn() as unknown as VmStoreDispatch },
  );
  return { actions, statuses };
}

test("a bare `load,` keeps the loaded VM files", async () => {
  const { actions, statuses } = vmHarness();
  expect(actions.loadVm(VM_FILES)).toBe(true);
  actions.loadTest("MemoryTestVME.tst", "load,\nvmstep;\n");
  await actions.testStep();
  expect(statuses.filter((s) => /Runtime error/.test(s))).toEqual([]);
});

test("an explicit missing .vm file still reports Cannot find", async () => {
  const { actions, statuses } = vmHarness();
  expect(actions.loadVm(VM_FILES)).toBe(true);
  actions.loadTest("/proj/T.tst", "load Missing.vm,\nvmstep;\n");
  await expect(actions.testStep()).resolves.toBe(true);
  expect(statuses).toContainEqual(
    expect.stringMatching(/Cannot find \/proj\/Missing\.vm/),
  );
});

test("testStep reports a non-Error rejection instead of throwing", async () => {
  // jiffies fs rejects with `undefined` for missing paths.
  const fs = {
    stat: async () => ({ isFile: () => true }),
    readFile: () => Promise.reject(undefined),
  } as unknown as FileSystem;
  const { actions, statuses } = vmHarness(fs);
  actions.loadTest("/proj/T.tst", "load Main.vm,\nvmstep;\n");
  await expect(actions.testStep()).resolves.toBe(true);
  expect(statuses).toContain("Runtime error: undefined");
});
