import { expect, test } from "@playwright/test";

test(
  "user picks Dark theme in Settings and the choice survives a reload",
  { tag: ["@settings"] },
  async ({ page }) => {
    await page.goto("");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await page.locator('li[data-tooltip="Settings"]').click();
    const dialog = page.locator("dialog[open] article.settings-dialog");
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await dialog.locator("a.close").click();
    await expect(dialog).toBeHidden();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  },
);
