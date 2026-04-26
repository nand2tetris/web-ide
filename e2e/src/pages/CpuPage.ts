import { expect, type Page } from "@playwright/test";
import { FilePicker } from "./FilePicker";

export class CpuPage {
  readonly filePicker: FilePicker;

  constructor(private _page: Page) {
    this.filePicker = new FilePicker(_page);
  }

  get page(): Page {
    return this._page;
  }

  async selectTst(name: string): Promise<void> {
    const picker = this._page.locator('select[data-testid="test-picker"]');
    await picker.selectOption(name);
    await expect(picker).toHaveValue(name);
    await expect(
      this._page.locator('article._test_panel [data-tooltip="Run"]'),
    ).toBeEnabled();
  }

  async loadProgram(pathSegments: string[]): Promise<void> {
    await this._page
      .locator(
        'article.panel.memory.ROM [data-tooltip="Load an .asm or .hack file"]',
      )
      .click();
    await this.filePicker.selectPath(pathSegments);
  }

  async setRamCell(_address: number, _value: number): Promise<void> {
    throw new Error("not implemented");
  }

  async readRamCell(_address: number): Promise<number> {
    throw new Error("not implemented");
  }

  async step(): Promise<void> {
    throw new Error("not implemented");
  }

  async reset(): Promise<void> {
    throw new Error("not implemented");
  }

  async readRegister(_name: string): Promise<number> {
    throw new Error("not implemented");
  }
}
