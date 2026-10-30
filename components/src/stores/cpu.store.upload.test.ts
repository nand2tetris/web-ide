import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
import * as mult from "@nand2tetris/projects/project_04/01_mult.js";
import { ROM } from "@nand2tetris/simulator/cpu/memory.js";
import { loadAsm } from "@nand2tetris/simulator/loader.js";
import { produce } from "immer";
import { expect, test, vi } from "vitest";
import { CpuPageState, CpuStoreDispatch, makeCpuStore } from "./cpu.store.js";

// #622: a .tst uploaded from disk reaches the store as a bare basename and is
// never written to `fs`, so `load Mult.asm` resolved to the missing /Mult.asm.
const TST = "load Mult.asm,\nticktock;\n";

async function runTest(tstPath: string) {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  await fs.mkdir("/proj");
  await fs.writeFile("/proj/Prog.hack", "0000000000000000\n1110110000010000");
  const statuses: string[] = [];
  const { actions } = makeCpuStore(
    fs,
    (s) =>
      statuses.push(
        typeof s === "string" ? s : "message" in s ? s.message : "",
      ),
    {},
    { current: vi.fn() as unknown as CpuStoreDispatch },
  );
  // The Assembler hands over a saved program: replaceROM, then setPath.
  const rom = new ROM();
  rom.loadBytes([0x0000, 0xec10]);
  actions.replaceROM(rom);
  await actions.setPath("/proj/Prog.hack");
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

test("a program the test loaded is reloaded on the next run", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  await fs.mkdir("/proj");
  await fs.writeFile("/proj/Prog.hack", "0000000000000111");
  const { actions } = makeCpuStore(
    fs,
    vi.fn(),
    {},
    { current: vi.fn() as unknown as CpuStoreDispatch },
  );
  // Start from an empty ROM that is not file backed, as `clear` leaves it.
  const rom = new ROM();
  actions.replaceROM(rom);
  const tst = "load Prog.hack;\n";
  actions.compileTest(tst, "", "/proj/Prog.tst");
  await actions.testStep();

  // The student saves an edited program, for example from the Assembler.
  await fs.writeFile("/proj/Prog.hack", "0000000000001001");
  actions.compileTest(tst, "", "/proj/Prog.tst");
  await actions.testStep();

  expect(rom.get(0)).toBe(9);
});

// #622: in browser storage, the starter Mult.asm (only comments) sits next to
// Mult.tst, so `load Mult.asm` replaced an uploaded program with an empty ROM.
const MULT = `
@R2
M=0
@R0
D=M
@END
D;JEQ
(LOOP)
@R1
D=M
@R2
M=D+M
@R0
M=M-1
D=M
@LOOP
D;JGT
(END)
@END
0;JMP
`;

test("a test loaded from the file system keeps an uploaded program", async () => {
  const fs = new FileSystem(new ObjectFileSystemAdapter({}));
  await fs.mkdir("/projects/04/Mult");
  await fs.writeFile("/projects/04/Mult/Mult.asm", mult.asm);
  await fs.writeFile("/projects/04/Mult/Mult.tst", mult.tst);
  await fs.writeFile("/projects/04/Mult/Mult.cmp", mult.cmp);

  const statuses: string[] = [];
  const dispatch = { current: vi.fn() as unknown as CpuStoreDispatch };
  const { initialState, reducers, actions } = makeCpuStore(
    fs,
    (s) =>
      statuses.push(
        typeof s === "string" ? s : "message" in s ? s.message : "",
      ),
    {},
    dispatch,
  );
  let state = initialState;
  dispatch.current = (({ action, payload }) => {
    state = produce(state, (draft: CpuPageState) => {
      reducers[action].call(reducers, draft, payload as never);
    });
  }) as CpuStoreDispatch;

  // The CPU page uploads a program from disk: it clears the test, then the
  // ROM panel writes the assembled program into the ROM.
  actions.clearTest();
  initialState.sim.ROM.loadBytes(await loadAsm(MULT));

  // The test panel picks Mult.tst from the browser file system.
  expect(actions.compileTest(mult.tst, "", "/projects/04/Mult/Mult.tst")).toBe(
    true,
  );
  actions.reset();
  while (!(await actions.testStep()));

  expect(statuses).toContain(
    "Simulation successful: The output file is identical to the compare file",
  );
});
