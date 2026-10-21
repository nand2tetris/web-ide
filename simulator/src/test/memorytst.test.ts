// Regression for #561: Memory.tst keyboard loop `while out <> 75 { tick, tock, }`.
// With ',' separators the whole while loop runs inside ONE Test.step() call; step()
// must still yield to the event loop so keyboard events can arrive.
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
  const test = unwrap(
    ChipTest.from(unwrap(TST.parse(tstWith(sep))), { requireLoad: false }),
  ).with(mem);
  test.reset();
  // The keyboard event arrives on a later macrotask, like a real key press.
  const timer = setTimeout(() => {
    // biome-ignore lint/complexity/useLiteralKeys: private keyboard device
    mem["keyboard"].setKey(75);
  }, 10);
  try {
    await test.step(); // output-list;
    await test.step(); // set address, while {...}
  } finally {
    clearTimeout(timer);
  }
  return mem.out().busVoltage;
}

describe("#561 Memory keyboard wait loop", () => {
  test("semicolon form still returns after one iteration", async () => {
    expect(await stepOnce(";")).toBe(0);
  });
  test("comma form yields to the event loop so a key press ends the loop", async () => {
    expect(await stepOnce(",")).toBe(75);
  });
});
