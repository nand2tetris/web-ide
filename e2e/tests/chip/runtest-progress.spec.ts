import { sol as AND_HDL } from "@nand2tetris/projects/testing/project_01/02_and.js";
import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

test.describe("runTest progress badges and reliable completion", () => {
  test.beforeEach(async ({ chipPage }) => {
    await chipPage.selectProject("01");
    await chipPage.selectChip("And");
    await chipPage.fillHdlEditor(AND_HDL);
  });

  test("progress badges show Steps: 0 and Outputs: 0 before any test runs", async ({
    chipPage,
  }) => {
    await chipPage.testPanel.expectStepCountText("Steps: 0");
    await chipPage.testPanel.expectOutputCountText("Outputs: 0");
  });

  test("runTest completes reliably for a fast chip and badges reflect progress", async ({
    chipPage,
  }) => {
    await chipPage.testPanel.runTest();

    const failures = await chipPage.testPanel.getFailureCount();
    expect(failures).toBe(0);

    // After a successful run, both counters must be non-zero.
    expect(await chipPage.testPanel.getStepCount()).toBeGreaterThan(0);
    expect(await chipPage.testPanel.getOutputCount()).toBeGreaterThan(0);
  });

  test("runTest with stuckTimeoutMs completes for RAM16K", async ({
    chipPage,
  }) => {
    test.setTimeout(30_000);
    await chipPage.selectProject("03");
    await chipPage.selectChip("RAM16K");
    await chipPage.enableBuiltin();
    await chipPage.resetTest();

    await chipPage.testPanel.runTest({ stuckTimeoutMs: 15_000 });

    expect(await chipPage.testPanel.getFailureCount()).toBe(0);
  });
});
