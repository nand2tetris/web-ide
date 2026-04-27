import { expect, type Locator } from "@playwright/test";

/**
 * Page object for the RAM memory panel as it appears on both the CPU and VM
 * tools. The panel exposes a base/format selector, an address input, and a
 * scrollable list of two-cell rows: an address cell followed by a value cell.
 *
 * The constructor takes a parent locator (not a Page) so the same component
 * can be scoped under whatever article/section contains the RAM panel on each
 * tool.
 */
export class RamPanel {
  constructor(private readonly root: Locator) {}

  private async row(address: number): Promise<Locator> {
    await this.root.locator("select").selectOption("dec");
    const addrInput = this.root.getByPlaceholder("Addr");
    await addrInput.fill(String(address));
    await addrInput.press("Enter");
    const indexCell = this.root
      .locator("code:first-child")
      .filter({ hasText: new RegExp(`^\\s*${address}\\s*$`) })
      .first();
    await expect(indexCell).toBeVisible();
    return indexCell;
  }

  async readAt(address: number): Promise<number> {
    const indexCell = await this.row(address);
    const value = await indexCell.evaluate(
      (el) => el.nextElementSibling?.textContent?.trim() ?? "",
    );
    return Number(value);
  }

  async writeAt(address: number, value: number): Promise<void> {
    const indexCell = await this.row(address);
    const valueCell = indexCell.locator("xpath=following-sibling::code[1]");
    await valueCell.click();
    const input = valueCell.locator("input");
    await input.fill(String(value));
    await input.press("Enter");
    await expect.poll(async () => await this.readAt(address)).toBe(value);
  }
}
