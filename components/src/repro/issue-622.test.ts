import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { ROM } from "@nand2tetris/simulator/cpu/memory.js";
import { produce } from "immer";
import { expect, test, vi } from "vitest";
import { CpuStoreDispatch, makeCpuStore } from "../stores/cpu.store.js";

// https://github.com/nand2tetris/web-ide/issues/622 (consolidates #527)
// Browsers without the File System Access API (Safari, Firefox) can only upload
// local files. test_panel.tsx hands the store just the tst's basename as its
// path and never writes the upload into `fs`, so a `load Mult.asm` in the script
// resolves to `/Mult.asm`, which does not exist: "Cannot find /Mult.asm".
const TST = `load Mult.asm,
output-list RAM[2]%D2.6.2;
repeat 4 { ticktock; }
output;`;

// `test.fails`: red until #622 is fixed; remove the `.fails` with the fix.
test.fails("a locally uploaded .tst with a `load` line runs against the loaded ROM", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  const setStatus = vi.fn();
  const dispatch = { current: vi.fn() as unknown as CpuStoreDispatch };
  const { initialState, reducers, actions } = makeCpuStore(
    fs,
    setStatus,
    {},
    dispatch,
  );
  let state = initialState;
  dispatch.current = ((c: {
    action: keyof typeof reducers;
    payload?: unknown;
  }) => {
    state = produce(state, (d) => {
      reducers[c.action].call(reducers, d, c.payload as never);
    });
  }) as CpuStoreDispatch;

  const rom = new ROM();
  rom.loadBytes([0x0000, 0xec10, 0x0000, 0xe308]);
  actions.replaceROM(rom); // loaded from a local .hack / .asm upload
  // test_panel.tsx: setPath(tstFile.name), setTst(tstFile.content)
  expect(actions.compileTest(TST, "", "Mult.tst")).toBe(true);

  await actions.testStep();

  const errors = setStatus.mock.calls
    .map(([s]) => (typeof s === "string" ? s : s.message))
    .filter((m) => /Cannot find/.test(m));
  expect(errors).toEqual([]);
  expect(state.sim.ROM.get(1)).toBe(0xec10);
});
