import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { ROM } from "@nand2tetris/simulator/cpu/memory.js";
import { expect, test, vi } from "vitest";
import { CpuStoreDispatch, makeCpuStore } from "./cpu.store.js";

// #622: a .tst uploaded from disk reaches the store as a bare basename and is
// never written to `fs`, so `load Mult.asm` resolved to the missing /Mult.asm.
const TST = "load Mult.asm,\nticktock;\n";

function runTest(tstPath: string) {
  const statuses: string[] = [];
  const { actions } = makeCpuStore(
    new FileSystem(new ObjectFileSystemAdapter({})),
    (s) => statuses.push(typeof s === "string" ? s : s.message),
    {},
    { current: vi.fn() as unknown as CpuStoreDispatch },
  );
  const rom = new ROM();
  rom.loadBytes([0x0000, 0xec10]);
  actions.replaceROM(rom);
  expect(actions.compileTest(TST, "", tstPath)).toBe(true);
  return actions.testStep().then(() => statuses);
}

test("a bare test path keeps the loaded ROM", async () => {
  const statuses = await runTest("Mult.tst");
  expect(statuses.filter((m) => /Cannot find/.test(m))).toEqual([]);
});

test("a missing file next to a real test path is still an error", async () => {
  const statuses = await runTest("/proj/Mult.tst");
  expect(statuses).toContainEqual(
    expect.stringMatching(/Cannot find \/proj\/Mult\.asm/),
  );
});
