import { expect, type Locator, type Page } from "@playwright/test";
import { EditorPanel } from "./EditorPanel";

export class VmPage {
  editor: EditorPanel;

  constructor(private _page: Page) {
    this.editor = new EditorPanel(_page);
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

  async step(): Promise<void> {
    await this.vmRunbar.locator('[data-tooltip="Step"]').click();
  }

  async run(): Promise<void> {
    await this.vmRunbar.locator('[data-tooltip="Run"]').click();
  }

  async reset(): Promise<void> {
    await this.vmRunbar.locator('[data-tooltip="Reset"]').click();
  }

  async waitForHalt(): Promise<void> {
    await expect(this._page.getByText("Program halted")).toBeVisible();
  }

  async readRam(_address: number): Promise<number> {
    throw new Error("not implemented");
  }
}
