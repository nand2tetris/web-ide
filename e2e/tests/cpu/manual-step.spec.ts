import { expect } from "@playwright/test";
import { test } from "../../fixtures/cpu.fixture";

test(
  "Learner loads Max.hack, sets RAM inputs, steps the CPU, and sees RAM[2] hold the maximum",
  { tag: "@cpu" },
  async ({ cpuPage }) => {
    await cpuPage.loadProgram(["projects", "05", "Max.hack"]);

    await cpuPage.setRamCell(0, 3);
    await cpuPage.setRamCell(1, 5);

    for (let i = 0; i < 30; i++) {
      await cpuPage.step();
      if ((await cpuPage.readRamCell(2)) === 5) break;
    }

    expect(await cpuPage.readRamCell(2)).toBe(5);

    await cpuPage.reset();

    expect(await cpuPage.readRegister("PC")).toBe(0);
  },
);
