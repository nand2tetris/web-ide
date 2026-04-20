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

  private pinRow(pin: string) {
    return this._page
      .locator("tr")
      .filter({ has: this._page.locator(`td:text-is("${pin}")`) });
  }

  private pinButton(pin: string) {
    return this.pinRow(pin).locator('[data-testid="pin-0"]');
  }

  private async busInput(pin: string) {
    const row = this.pinRow(pin);
    const ctrl = row.locator("button.pin-control");
    if ((await ctrl.textContent()) === "dec") {
      await ctrl.click();
    }
    return row.locator("input");
  }

  async setInput(pin: string, value: 0 | 1): Promise<void> {
    const button = this.pinButton(pin);
    const currentText = await button.textContent();
    const current = parseInt(currentText?.trim() ?? "0");
    if (current !== value) {
      await button.click();
    }
  }

  async getOutput(pin: string): Promise<number> {
    const button = this.pinButton(pin);
    const text = await button.textContent();
    return parseInt(text?.trim() ?? "0");
  }

  private get clockButton() {
    return this._page.getByRole("button", { name: /Clock/ });
  }

  async tickClock(): Promise<void> {
    await expect(this.clockButton).not.toContainText("+");
    await this.clockButton.click();
  }

  async tockClock(): Promise<void> {
    await expect(this.clockButton).toContainText("+");
    await this.clockButton.click();
  }

  async evalChip(): Promise<void> {
    await this._page.getByRole("button", { name: "Eval" }).click();
  }

  async resetTest(): Promise<void> {
    await this._page.click('[data-tooltip="Reset"]');
  }

  async disableBuiltin(): Promise<void> {
    await this.setBuiltin(false);
  }

  async enableBuiltin(): Promise<void> {
    await this.setBuiltin(true);
  }

  private async setBuiltin(enabled: boolean): Promise<void> {
    const builtinSwitch = this._page.getByRole("switch", { name: "Builtin" });
    if ((await builtinSwitch.isChecked()) !== enabled) {
      await builtinSwitch.click();
    }
  }

  async setBusInput(pin: string, value: number): Promise<void> {
    const input = await this.busInput(pin);
    await input.fill(String(value));
  }

  async getBusOutput(pin: string): Promise<number> {
    const input = await this.busInput(pin);
    await expect(input).not.toHaveValue("");
    return parseInt(await input.inputValue(), 10);
  }

  async fillHdlEditor(content: string): Promise<void> {
    const textarea = this._page.locator('[data-testid="editor-hdl"]');
    await expect(textarea).toBeEnabled();
    await textarea.fill(content);
  }
}
