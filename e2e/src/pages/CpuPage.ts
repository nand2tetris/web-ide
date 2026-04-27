import { expect, type Page } from "@playwright/test";
import { FilePicker } from "./FilePicker";
import { RamPanel } from "./RamPanel";

export class CpuPage {
  readonly filePicker: FilePicker;
  readonly ramPanel: RamPanel;

  constructor(private _page: Page) {
    this.filePicker = new FilePicker(_page);
    this.ramPanel = new RamPanel(_page.locator("article.panel.memory.RAM"));
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

  private get ioPanel() {
    return this._page.locator("article.panel.IO");
  }

  async readRamCell(address: number): Promise<number> {
    return this.ramPanel.readAt(address);
  }

  async setRamCell(address: number, value: number): Promise<void> {
    await this.ramPanel.writeAt(address, value);
  }

  async step(): Promise<void> {
    await this.ioPanel.locator('[data-tooltip="Step"]').click();
  }

  async reset(): Promise<void> {
    await this.ioPanel.locator('[data-tooltip="Reset"]').click();
    await expect.poll(async () => await this.readRegister("PC")).toBe(0);
  }

  async readRegister(name: "PC" | "A" | "D"): Promise<number> {
    const text = await this._page
      .locator(`[data-testid="register-${name}"]`)
      .textContent();
    return Number((text ?? "").trim());
  }
}
