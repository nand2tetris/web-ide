import { expect, type Locator, type Page } from "@playwright/test";

export class EditorPanel {
  readonly monacoEditor: Locator;
  private usingMonaco = true;

  constructor(private page: Page) {
    this.monacoEditor = page.locator(".monaco-editor").nth(0);
  }

  async enableMonaco(): Promise<void> {
    await this.setMonaco(true);
  }

  async disableMonaco(): Promise<void> {
    await this.setMonaco(false);
  }

  private async setMonaco(enabled: boolean): Promise<void> {
    await this.page.locator('[data-tooltip="Settings"]').click();
    const monacoSwitch = this.page.getByRole("switch", {
      name: "Use Monaco Editor",
    });
    if ((await monacoSwitch.isChecked()) !== enabled) {
      await monacoSwitch.click();
    }
    if (enabled) {
      await expect(monacoSwitch).toBeChecked();
    } else {
      await expect(monacoSwitch).not.toBeChecked();
    }
    const closeButton = this.page.locator(".settings-dialog a.close");
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    this.usingMonaco = enabled;
  }

  async clearEditor(editor: string): Promise<void> {
    if (this.usingMonaco) {
      await this.monacoEditor.click();
      await this.page.keyboard.press("Control+A");
      await this.page.keyboard.press("Backspace");
      await this.page.keyboard.press("Backspace");
    } else {
      await this.page.getByTestId(`editor-${editor}`).clear();
    }
  }

  async write(text: string, editor: string): Promise<void> {
    await this.clearEditor(editor);
    if (this.usingMonaco) {
      await this.page.keyboard.type(text);
    } else {
      await this.page.getByTestId(`editor-${editor}`).fill(text);
    }
  }
}
