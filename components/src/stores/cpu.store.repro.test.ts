import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { produce } from "immer";
import { MutableRefObject } from "react";
import { CpuStoreDispatch, makeCpuStore } from "./cpu.store.js";

const HACK = ["0000000000000010", "1110110000010000"].join("\n"); // @2 ; D=A
const TST = `load Prog.hack,
repeat 2 { ticktock; }
output-list RAM[0]%D1.6.1;
output;`;
const TST_NOLOAD = `repeat 2 { ticktock; }
output-list D%D1.6.1;
output;`;

function mk(files: Record<string, string> = {}) {
  const dispatch: MutableRefObject<CpuStoreDispatch> = { current: vi.fn() };
  const setStatus = vi.fn();
  const { initialState, actions, reducers } = makeCpuStore(
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

const romWords = (s: ReturnType<typeof mk>) => s.state.sim.ROM.range(0, 2);

describe("repro #622/#527: ROM survives test-script load + Run", () => {
  it("UI sequence: load .hack into ROM, then compile a no-load test, reset, run", async () => {
    const s = mk();
    s.state.sim.ROM.loadBytes([2, 0xec10 - 0x10000]); // what MemoryComponent.doLoad does
    const before = romWords(s);
    s.actions.compileTest(TST_NOLOAD, "", "Foo.tst"); // cpu.tsx effect
    s.actions.reset();
    await s.actions.testStep();
    expect(romWords(s)).toEqual(before);
  });

  it("local-upload sequence: test script has `load Prog.hack`, but file only exists in the browser upload (not in fs)", async () => {
    const s = mk({});
    s.state.sim.ROM.loadBytes([2, 0xec10 - 0x10000]);
    const before = romWords(s);
    s.actions.compileTest(TST, "", "Prog.tst");
    s.actions.reset();
    await s.actions.testStep();
    await s.actions.testStep();
    expect(romWords(s)).toEqual(before);
  });

  it("path sequence: file exists in fs next to the tst", async () => {
    const s = mk({ "p/Prog.hack": HACK, "p/Prog.tst": TST });
    s.state.sim.ROM.loadBytes([2, 0xec10 - 0x10000]);
    const before = romWords(s);
    s.actions.compileTest(TST, "", "p/Prog.tst");
    s.actions.reset();
    await s.actions.testStep();
    await s.actions.testStep();
    expect(romWords(s).length).toBe(2);
    expect(romWords(s)).not.toEqual([0, 0]);
    expect(before).not.toEqual([0, 0]);
  });
});
