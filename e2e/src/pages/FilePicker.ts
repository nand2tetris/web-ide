import { expect, type Locator, type Page } from "@playwright/test";

export class FilePicker {
  readonly dialog: Locator;
  private readonly vmRunbar: Locator;

  constructor(private _page: Page) {
    this.dialog = _page.locator("article.file-select");
    this.vmRunbar = _page.locator("article.panel.program");
  }

  async open(): Promise<void> {
    await this.vmRunbar.locator('[data-tooltip="Load files"]').click();
    await expect(this.dialog).toBeVisible();
  }

  async cd(_segment: string): Promise<void> {
    throw new Error("not implemented");
  }

  async select(_basename: string): Promise<void> {
    throw new Error("not implemented");
  }

  async confirm(): Promise<void> {
    throw new Error("not implemented");
  }

  async selectPath(_pathSegments: string[]): Promise<void> {
    throw new Error("not implemented");
  }
}
