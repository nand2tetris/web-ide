import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { produce } from "immer";
import { expect, test, vi } from "vitest";
import { makeVmStore, VmStoreDispatch } from "../stores/vm.store.js";

// https://github.com/nand2tetris/web-ide/issues/673
// "No .vm files to load. Compile your Jack files first." after uploading the
// compiled folder and then the VME .tst. Same root cause as #622: local uploads
// are handed to the store as `LocalFile`s and never written to `fs`, and the
// uploaded tst's path is just its basename, so a bare `load,` in the script
// scans "" instead of the VMs the user already loaded.
const VM_FILES = [
  { name: "Main", content: "function Main.main 0\npush constant 7\nreturn\n" },
];
const TST = `load,
output-list RAM[0]%D1.6.1;
repeat 2 { vmstep; }
output;`;

// `test.fails`: red until #673 is fixed; remove the `.fails` with the fix.
test.fails("a locally uploaded VME .tst keeps the locally uploaded VM files", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const statuses: string[] = [];
  const setStatus = (s: string | { message: string }) =>
    statuses.push(typeof s === "string" ? s : s.message);
  const dispatch = { current: vi.fn() as unknown as VmStoreDispatch };
  const { initialState, reducers, actions } = makeVmStore(
    fs,
    setStatus,
    {},
    dispatch,
  );
  let state = initialState;
  const errors: unknown[] = [];
  dispatch.current = ((c: {
    action: keyof typeof reducers;
    payload?: unknown;
  }) => {
    if (c.action === "setError" && c.payload) errors.push(c.payload);
    state = produce(state, (d) => {
      reducers[c.action].call(reducers, d, c.payload as never);
    });
  }) as VmStoreDispatch;

  expect(actions.loadVm(VM_FILES)).toBe(true); // folder upload
  actions.loadTest("MemoryTestVME.tst", TST); // test_panel: setPath(tstFile.name)
  await actions.testStep();

  expect(statuses.filter((s) => /No \.vm files/.test(s))).toEqual([]);
  expect(JSON.stringify(errors)).not.toMatch(/No \.vm files/);
});

// Second defect behind the blank page: `fs.stat` on a missing path rejects with
// `undefined`, and `testStep`'s catch block reads `(e as Error).message`, so the
// handler itself throws a TypeError and escapes into the Timer (unhandled).
test.fails("testStep reports a non-Error rejection instead of throwing", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const statuses: string[] = [];
  const dispatch = { current: vi.fn() as unknown as VmStoreDispatch };
  const { actions } = makeVmStore(
    fs,
    (s) => statuses.push(typeof s === "string" ? s : s.message),
    {},
    dispatch,
  );
  actions.loadTest("MemoryTestVME.tst", "load,\nvmstep;\n");
  await expect(actions.testStep()).resolves.toBe(true);
  expect(statuses.some((s) => s.startsWith("Runtime error"))).toBe(true);
});
