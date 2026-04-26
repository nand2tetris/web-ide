import { expect, type Locator, type Page } from "@playwright/test";
import { FilePicker } from "./FilePicker";

export class VmPage {
  filePicker: FilePicker;

  constructor(private _page: Page) {
    this.filePicker = new FilePicker(_page);
  }

  get page(): Page {
    return this._page;
  }

  get vmStructures(): Locator {
    return this._page.locator("article.panel.vm");
  }

  private get vmRunbar(): Locator {
    return this._page.locator("article.panel.program");
  }

  async loadProjectFile(
    projectId: "07" | "08",
    name: string,
    fileName: string,
  ): Promise<void> {
    await this.filePicker.open();
    await this.filePicker.selectPath(["projects", projectId, name, fileName]);
  }

  async step(): Promise<void> {
    await this.clickRunbarButton("Step");
  }

  async run(): Promise<void> {
    await this.clickRunbarButton("Run");
  }

  async reset(): Promise<void> {
    await this.clickRunbarButton("Reset");
  }

  private async clickRunbarButton(tooltip: string): Promise<void> {
    await this.vmRunbar.locator(`[data-tooltip="${tooltip}"]`).click();
  }

  async waitForHalt(): Promise<void> {
    await expect(this._page.getByText("Program halted")).toBeVisible();
  }

  async readRam(address: number): Promise<number> {
    const ramPanel = this._page.locator("article.panel.memory.RAM");
    await ramPanel.locator("select").selectOption("dec");
    const addrInput = ramPanel.getByPlaceholder("Addr");
    await addrInput.fill(String(address));
    await addrInput.press("Enter");
    const indexCell = ramPanel
      .locator("code:first-child")
      .filter({ hasText: new RegExp(`^\\s*${address}\\s*$`) })
      .first();
    await expect(indexCell).toBeVisible();
    const value = await indexCell.evaluate(
      (el) => el.nextElementSibling?.textContent?.trim() ?? "",
    );
    return Number(value);
  }

  async fillEditor(content: string): Promise<void> {
    const textarea = this._page.locator('[data-testid="editor-vm"]');
    await expect(textarea).toBeEnabled();
    await textarea.fill(content);
  }
}
