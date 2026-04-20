import type { Page } from "@playwright/test";

export class TestPanel {
  constructor(private page: Page) {}

  async runTest(): Promise<void> {
    await this.page.click('[data-tooltip="Run"]');
    await this.page.waitForSelector('[data-tooltip="Run"]', {
      state: "visible",
      timeout: 30_000,
    });
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
