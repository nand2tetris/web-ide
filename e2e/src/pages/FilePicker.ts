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

  async cd(segment: string): Promise<void> {
    await this.entry(segment).dblclick();
  }

  async select(basename: string): Promise<void> {
    await this.entry(basename).click();
  }

  async confirm(): Promise<void> {
    await this.dialog
      .getByRole("button", { name: "Select", exact: true })
      .click();
    await expect(this.dialog).toBeHidden();
  }

  private entry(name: string): Locator {
    return this.dialog.getByRole("button", { name, exact: true });
  }

  async selectPath(_pathSegments: string[]): Promise<void> {
    throw new Error("not implemented");
  }
}
