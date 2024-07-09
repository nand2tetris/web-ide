import type { Locator, Page } from "@playwright/test";
import { test as base } from "@playwright/test";

export class MonacoPage {
  public readonly monacoEditor: Locator;
  constructor(readonly page: Page) {
    this.monacoEditor = page.locator(".monaco-editor").nth(0);
  }

  async clearEditor() {
    await this.monacoEditor.click();
    await this.page.keyboard.press("ControlOrMeta+KeyA");
    await this.page.keyboard.press("Backspace");
    await this.page.keyboard.press("ControlOrMeta+KeyA");
    await this.page.keyboard.press("Backspace");
  }

  async write(text: string) {
    await this.clearEditor();
    await this.monacoEditor.click();
    for (const line of text.split("\n")) {
      await this.page.keyboard.type(`${line}\n`);
    }
  }
}

export const test = base.extend<{ monaco: MonacoPage }>({
  monaco: async ({ page }, use) => {
    const monaco = new MonacoPage(page);
    await use(monaco);
  },
});
