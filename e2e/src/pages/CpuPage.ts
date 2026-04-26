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

  private get ramPanel() {
    return this._page.locator("article.panel.memory.RAM");
  }

  private get ioPanel() {
    return this._page.locator("article.panel.IO");
  }

  private async ramRow(address: number) {
    await this.ramPanel.locator("select").selectOption("dec");
    const addrInput = this.ramPanel.getByPlaceholder("Addr");
    await addrInput.fill(String(address));
    await addrInput.press("Enter");
    const indexCell = this.ramPanel
      .locator("code:first-child")
      .filter({ hasText: new RegExp(`^\\s*${address}\\s*$`) })
      .first();
    await expect(indexCell).toBeVisible();
    return indexCell;
  }

  async readRamCell(address: number): Promise<number> {
    const indexCell = await this.ramRow(address);
    const value = await indexCell.evaluate(
      (el) => el.nextElementSibling?.textContent?.trim() ?? "",
    );
    return Number(value);
  }

  async setRamCell(address: number, value: number): Promise<void> {
    const indexCell = await this.ramRow(address);
    const valueCell = indexCell.locator("xpath=following-sibling::code[1]");
    await valueCell.click();
    const input = valueCell.locator("input");
    await input.fill(String(value));
    await input.press("Enter");
    await expect.poll(async () => await this.readRamCell(address)).toBe(value);
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
