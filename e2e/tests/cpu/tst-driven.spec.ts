import { expect } from "@playwright/test";
import { TestPanel } from "../../src/pages/TestPanel";
import { test } from "../../fixtures/cpu.fixture";

test(
  "Learner loads Max.hack, picks MaxRam.tst from the dropdown, runs it, and sees zero failures",
  { tag: "@cpu" },
  async ({ cpuPage }) => {
    await cpuPage.loadProgram(["projects", "05", "Max.hack"]);

    await cpuPage.selectTst("MaxRam.tst");

    const testPanel = new TestPanel(cpuPage.page);
    await testPanel.runTest();

    expect(await testPanel.getFailureCount()).toBe(0);
  },
);
