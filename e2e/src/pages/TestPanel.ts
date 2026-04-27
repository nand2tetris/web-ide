import { expect, type Locator, type Page } from "@playwright/test";

const START_TIMEOUT_MS = 2_000;
const POLL_INTERVAL_MS = 500;

export class TestPanel {
  private readonly panel: Locator;

  constructor(private page: Page) {
    this.panel = page.locator("article._test_panel");
  }

  async runTest(options?: { stuckTimeoutMs?: number }): Promise<void> {
    const stuckTimeout = options?.stuckTimeoutMs ?? 5_000;

    await this.panel.locator('[data-tooltip="Run"]').click();

    await expect(this.panel.locator('[data-tooltip="Pause"]')).toBeVisible({
      timeout: START_TIMEOUT_MS,
    });

    let lastSnapshot = await this.#progressSnapshot();
    let lastProgressAt = Date.now();

    while (true) {
      const pauseCount = await this.panel
        .locator('[data-tooltip="Pause"]')
        .count();
      if (pauseCount === 0) return;

      const snapshot = await this.#progressSnapshot();
      if (snapshot !== lastSnapshot) {
        lastSnapshot = snapshot;
        lastProgressAt = Date.now();
      } else if (Date.now() - lastProgressAt > stuckTimeout) {
        throw new Error(
          `runTest: no progress for ${stuckTimeout}ms (last snapshot: "${lastSnapshot}")`,
        );
      }

      await this.page.waitForTimeout(POLL_INTERVAL_MS);
    }
  }

  async #progressSnapshot(): Promise<string> {
    const steps = this.panel.locator('[data-testid="test-step-count"]');
    const outputs = this.panel.locator('[data-testid="test-output-count"]');
    const [s, o] = await Promise.all([
      steps.textContent().catch(() => ""),
      outputs.textContent().catch(() => ""),
    ]);
    return `${s}|${o}`;
  }

  private get stepCountBadge(): Locator {
    return this.panel.locator('[data-testid="test-step-count"]');
  }

  private get outputCountBadge(): Locator {
    return this.panel.locator('[data-testid="test-output-count"]');
  }

  async expectStepCountText(text: string): Promise<void> {
    await expect(this.stepCountBadge).toBeVisible();
    await expect(this.stepCountBadge).toHaveText(text);
  }

  async expectOutputCountText(text: string): Promise<void> {
    await expect(this.outputCountBadge).toBeVisible();
    await expect(this.outputCountBadge).toHaveText(text);
  }

  async getStepCount(): Promise<number> {
    const text = await this.stepCountBadge.textContent();
    return parseInt(text?.replace("Steps: ", "") ?? "0", 10);
  }

  async getOutputCount(): Promise<number> {
    const text = await this.outputCountBadge.textContent();
    return parseInt(text?.replace("Outputs: ", "") ?? "0", 10);
  }

  async getFailureCount(): Promise<number> {
    const paragraph = this.panel.locator("p", {
      hasText: "comparison failure",
    });
    const count = await paragraph.count();
    if (count === 0) return 0;
    const text = await paragraph.first().textContent();
    const match = text?.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
