import { expect, type Page } from "@playwright/test";
import { TestPanel } from "./TestPanel";

export class ChipPage {
  testPanel: TestPanel;

  constructor(private _page: Page) {
    this.testPanel = new TestPanel(_page);
  }

  get page(): Page {
    return this._page;
  }

  async selectProject(value: string): Promise<void> {
    await this._page.selectOption('[data-testid="project-picker"]', { value });
  }

  async selectChip(name: string): Promise<void> {
    await this._page.selectOption('[data-testid="chip-picker"]', {
      label: name,
    });
    // Start without builtin
    await this.disableBuiltin();
  }

  async setInput(pin: string, value: 0 | 1): Promise<void> {
    const row = this._page
      .locator("tr")
      .filter({ has: this._page.locator(`td:text-is("${pin}")`) });
    const button = row.locator('[data-testid="pin-0"]');
    const currentText = await button.textContent();
    const current = parseInt(currentText?.trim() ?? "0");
    if (current !== value) {
      await button.click();
    }
  }

  async getOutput(pin: string): Promise<number> {
    const row = this._page
      .locator("tr")
      .filter({ has: this._page.locator(`td:text-is("${pin}")`) });
    const button = row.locator('[data-testid="pin-0"]');
    const text = await button.textContent();
    return parseInt(text?.trim() ?? "0");
  }

  async evalChip(): Promise<void> {
    await this._page.getByRole("button", { name: "Eval" }).click();
  }

  async resetTest(): Promise<void> {
    await this._page.click('[data-tooltip="Reset"]');
  }

  async disableBuiltin(): Promise<void> {
    const builtinSwitch = this._page.getByRole("switch", { name: "Builtin" });
    if (await builtinSwitch.isChecked()) {
      await builtinSwitch.click();
    }
  }

  async enableBuiltin(): Promise<void> {
    const builtinSwitch = this._page.getByRole("switch", { name: "Builtin" });
    if (!await builtinSwitch.isChecked()) {
      await builtinSwitch.click();
    }
  }

  async fillHdlEditor(content: string): Promise<void> {
    const inputArea = this._page.locator(
      "._hdl_panel .monaco-editor textarea.inputarea",
    );
    await expect(inputArea).not.toHaveAttribute("readonly");
    await this._page.locator("._hdl_panel .monaco-editor").click();
    await this._page.keyboard.press("ControlOrMeta+a");
    await this._page.keyboard.type(content);
  }
}
