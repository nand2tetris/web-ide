import type { Locator, Page } from "@playwright/test";
import { test as base } from "@playwright/test";

export class MonacoPage {
  private usingMonaco = true;
  public readonly monacoEditor: Locator;
  constructor(readonly page: Page) {
    this.monacoEditor = page.locator(".monaco-editor").nth(0);
  }

  async toggleMonaco() {
    await this.page.getByText("settings", { exact: true }).click();
    await this.page.getByText("Use Monaco Editor").click();
    await this.page
      .locator("header")
      .filter({ hasText: /^Settings$/ })
      .getByRole("link")
      .click();
    this.usingMonaco = !this.usingMonaco;
  }

  async clearEditor(editor: string) {
    if (this.usingMonaco) {
      await this.monacoEditor.click();
      await this.page.keyboard.press("ControlOrMeta+KeyA");
      await this.page.keyboard.press("Backspace");
      await this.page.keyboard.press("ControlOrMeta+KeyA");
      await this.page.keyboard.press("Backspace");
    } else {
      await this.page.getByTestId(`editor-${editor}`).clear();
    }
  }

  async write(text: string, editor: string) {
    await this.clearEditor(editor);
    if (this.usingMonaco) {
      await this.monacoEditor.click();
    } else {
      await this.page.getByTestId(`editor-${editor}`);
    }
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
