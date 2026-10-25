import { expect, type Locator, type Page } from "@playwright/test";

/** Helper for specs that run with Monaco enabled (no `?monaco=0`). */
export class EditorPanel {
  readonly monacoEditor: Locator;

  constructor(private page: Page) {
    this.monacoEditor = page.locator(".monaco-editor").first();
  }

  /**
   * Replace the editor contents by pasting from the clipboard. Both
   * `keyboard.type` and `keyboard.insertText` go through Monaco's typing path,
   * which auto-indents each new line and auto-closes brackets; paste does not.
   * Paste is a native browser command, so it follows the host platform.
   */
  async write(text: string): Promise<void> {
    await expect(this.monacoEditor).toBeVisible();
    await this.selectAll();
    await this.page.keyboard.press("Backspace");
    await this.grantClipboard();
    await this.page.evaluate((t) => navigator.clipboard.writeText(t), text);
    await this.page.keyboard.press("ControlOrMeta+V");
  }

  /**
   * Read the full editor text through the clipboard, since Monaco only renders
   * the lines in view. Grants clipboard permissions on the page's context.
   */
  async read(): Promise<string> {
    await this.grantClipboard();
    await this.selectAll();
    // Copy is a native browser command, which follows the host platform.
    await this.page.keyboard.press("ControlOrMeta+C");
    const text = await this.page.evaluate(() => navigator.clipboard.readText());
    // Monaco uses CRLF line endings under the Windows user agent.
    return text.replace(/\r\n/g, "\n");
  }

  private async grantClipboard(): Promise<void> {
    await this.page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
  }

  /**
   * Monaco picks Ctrl or Cmd from the user agent, not the host. The "Desktop
   * Chrome" device reports Windows, so Monaco binds Ctrl on every host.
   */
  private async selectAll(): Promise<void> {
    await this.monacoEditor.click();
    await this.page.keyboard.press("Control+A");
  }
}
