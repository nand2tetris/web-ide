import { expect, type Locator, type Page } from "@playwright/test";

export class FilePicker {
  private readonly dialog: Locator;
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
    const before = (await this.cwdHeader.textContent()) ?? "";
    const after = before === "/" ? `/${segment}` : `${before}/${segment}`;
    await this.entry(segment).dblclick();
    await expect(this.cwdHeader).toHaveText(after);
  }

  async select(basename: string): Promise<void> {
    const entry = this.entry(basename);
    await entry.click();
    await expect(entry).not.toHaveClass(/(?:^|\s)secondary(?:\s|$)/);
  }

  async confirm(): Promise<void> {
    await this.dialog
      .getByRole("button", { name: "Select", exact: true })
      .click();
    await expect(this.dialog).toBeHidden();
  }

  private get cwdHeader(): Locator {
    return this.dialog.locator("main > div > b");
  }

  private entry(name: string): Locator {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return this.dialog.locator(".files-container button").filter({
      hasText: new RegExp(`^\\s*(?:folder|draft)\\s*${escaped}\\s*$`),
    });
  }

  async selectPath(pathSegments: string[]): Promise<void> {
    const directories = pathSegments.slice(0, -1);
    const last = pathSegments[pathSegments.length - 1];
    for (const segment of directories) {
      const cwd = (await this.cwdHeader.textContent()) ?? "";
      if (!cwd.endsWith(`/${segment}`)) {
        await this.cd(segment);
      }
    }
    await this.select(last);
    await this.confirm();
  }
}
