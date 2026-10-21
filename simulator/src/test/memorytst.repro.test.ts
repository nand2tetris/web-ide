// Repro for #561: Memory.tst keyboard loop `while out <> 75 { tick, tock, }`.
// With ',' separators the whole while loop runs inside ONE Test.step() call, never
// yielding to the event loop (so keyboard events / UI can never update) => browser hang.
// With ';' (what projects/src/project_05/01_memory.ts has at HEAD) each iteration returns.
import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { describe, expect, test } from "vitest";
import { Memory } from "../chip/builtins/computer/computer.js";
import { TST } from "../languages/tst.js";
import { ChipTest } from "./chiptst.js";

const tstWith = (sep: string) => `
output-list out%D1.6.1;
set address 24576,
while out <> 75 {
    tick, tock${sep}
}
output;
`;

async function stepOnce(sep: string) {
  const mem = new Memory();
  let ticks = 0;
  const origTick = mem.eval.bind(mem);
  mem.eval = () => {
    if (++ticks > 5000) throw new Error("BUSY LOOP: step() never returned");
    origTick();
  };
  const test = unwrap(
    ChipTest.from(unwrap(TST.parse(tstWith(sep))), { requireLoad: false }),
  ).with(mem);
  test.reset();
  let threw = false;
  try {
    await test.step(); // output-list;
    await test.step(); // set address, while {...}
  } catch {
    threw = true;
  }
  return { ticks, threw };
}

describe("#561 Memory keyboard wait loop", () => {
  test("semicolon form yields after one iteration (HEAD project file)", async () => {
    const r = await stepOnce(";");
    expect(r.threw).toBe(false);
  });
  test("comma form spins inside a single step() (user-reported hang)", async () => {
    const r = await stepOnce(",");
    // Failing assertion == bug reproduced: step() should be able to return to the UI.
    expect(r.threw).toBe(false);
  });
});
