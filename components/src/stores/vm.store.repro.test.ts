import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { produce } from "immer";
import { MutableRefObject } from "react";
import { makeVmStore, VmStoreDispatch } from "./vm.store.js";

const MAIN_VM = `function Main.main 0
push constant 1
pop temp 0
push constant 0
return`;
// Typical OS-style test script: `load;` loads every .vm in the tst's folder.
const TST = `load,
repeat 5 { vmstep; }
output-list RAM[0]%D1.6.1;
output;`;
const TST_LOAD_DIR = TST.replace("load,", "load,");

function mk(files: Record<string, string>) {
  const dispatch: MutableRefObject<VmStoreDispatch> = { current: vi.fn() };
  const setStatus = vi.fn();
  const { initialState, actions, reducers } = makeVmStore(
    new FileSystem(new ObjectFileSystemAdapter(files)),
    setStatus,
    {},
    dispatch,
  );
  const store = { state: initialState, actions, setStatus };
  // biome-ignore lint/suspicious/noExplicitAny: test
  dispatch.current = vi.fn().mockImplementation((c: any) => {
    store.state = produce(store.state, (d: typeof initialState) => {
      // biome-ignore lint/suspicious/noExplicitAny: test
      (reducers as any)[c.action](d, c.payload);
    });
  });
  return store;
}

describe("repro #673: VM tst-only upload", () => {
  it("control: tst inside the folder that holds the .vm files", async () => {
    const s = mk({ "MemoryTest/Main.vm": MAIN_VM });
    s.actions.loadVm([{ name: "Main", content: MAIN_VM }]);
    s.actions.loadTest("MemoryTest/MemoryTestVME.tst", TST);
    await s.actions.testStep();
    expect(JSON.stringify(s.setStatus.mock.calls)).not.toContain("No .vm");
    expect(s.state.controls.valid).toBe(true);
  });

  it("tst uploaded alone (path is bare upload name) after a program was already loaded: 'load' resolves dir '' and must not wipe VM / report 'No .vm files'", async () => {
    const s = mk({ "MemoryTest/Main.vm": MAIN_VM });
    s.actions.loadVm([{ name: "Main", content: MAIN_VM }]);
    s.actions.loadTest("MemoryTestVME.tst", TST); // vm.tsx effect: setPath(tstFile.name)
    await s.actions.testStep();
    expect(JSON.stringify(s.setStatus.mock.calls)).not.toContain("No .vm");
    expect(s.state.controls.valid).toBe(true);
  });
});
