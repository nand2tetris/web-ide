import { expect } from "@playwright/test";
import { TestPanel } from "../../src/pages/TestPanel";
import { test } from "../../fixtures/cpu.fixture";

test(
  "Learner runs MaxRam.tst, sees the success message, resets the test, and the message clears",
  { tag: "@cpu" },
  async ({ cpuPage }) => {
    await cpuPage.loadProgram(["projects", "05", "Max.hack"]);

    await cpuPage.selectTst("MaxRam.tst");

    const testPanel = new TestPanel(cpuPage.page, "Run Test");
    await testPanel.runTest();

    const status = cpuPage.page.locator(".StatusLine");
    await expect(status).toHaveText(/^Simulation successful/);

    await testPanel.reset();

    await expect(status).toHaveText("");
  },
);
