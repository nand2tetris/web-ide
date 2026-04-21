import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const AND_HDL = `CHIP And {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a, b=b, out=x);
    Not(in=x, out=out);
}`;

test.describe("runTest progress badges and reliable completion", () => {
  test.beforeEach(async ({ chipPage }) => {
    await chipPage.selectProject("01");
    await chipPage.selectChip("And");
    await chipPage.fillHdlEditor(AND_HDL);
  });

  test("progress badges show Steps: 0 and Outputs: 0 before any test runs", async ({
    chipPage,
  }) => {
    const steps = chipPage.page.locator('[data-testid="test-step-count"]');
    const outputs = chipPage.page.locator('[data-testid="test-output-count"]');

    await expect(steps).toBeVisible();
    await expect(outputs).toBeVisible();
    await expect(steps).toHaveText("Steps: 0");
    await expect(outputs).toHaveText("Outputs: 0");
  });

  test("runTest completes reliably for a fast chip and badges reflect progress", async ({
    chipPage,
  }) => {
    await chipPage.testPanel.runTest();

    const failures = await chipPage.testPanel.getFailureCount();
    expect(failures).toBe(0);

    const steps = chipPage.page.locator('[data-testid="test-step-count"]');
    const outputs = chipPage.page.locator('[data-testid="test-output-count"]');

    // After a successful run, both counters must be non-zero.
    const stepText = await steps.textContent();
    const outputText = await outputs.textContent();
    const stepCount = parseInt(stepText?.replace("Steps: ", "") ?? "0", 10);
    const outputCount = parseInt(
      outputText?.replace("Outputs: ", "") ?? "0",
      10,
    );

    expect(stepCount).toBeGreaterThan(0);
    expect(outputCount).toBeGreaterThan(0);
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
