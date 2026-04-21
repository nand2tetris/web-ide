import type { Page } from "@playwright/test";

export class TestPanel {
  constructor(private page: Page) {}

  async runTest(options?: { stuckTimeoutMs?: number }): Promise<void> {
    const stuckTimeout = options?.stuckTimeoutMs ?? 5_000;

    await this.page.click('[data-tooltip="Run"]');

    await this.page.waitForSelector('[data-tooltip="Pause"]', {
      timeout: 2_000,
    });

    let lastSnapshot = await this.#progressSnapshot();
    let lastProgressAt = Date.now();

    while (true) {
      const pauseCount = await this.page
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

      await this.page.waitForTimeout(500);
    }
  }

  async #progressSnapshot(): Promise<string> {
    const steps = this.page.locator('[data-testid="test-step-count"]');
    const outputs = this.page.locator('[data-testid="test-output-count"]');
    const [s, o] = await Promise.all([
      steps.textContent().catch(() => ""),
      outputs.textContent().catch(() => ""),
    ]);
    return `${s}|${o}`;
  }

  async getFailureCount(): Promise<number> {
    const paragraph = this.page.locator("p", {
      hasText: "comparison failure",
    });
    const count = await paragraph.count();
    if (count === 0) return 0;
    const text = await paragraph.first().textContent();
    const match = text?.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
}
