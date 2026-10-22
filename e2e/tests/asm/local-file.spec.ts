import { expect, test } from "@playwright/test";

// https://github.com/nand2tetris/web-ide/issues/602
// The Assembler's "Load file" used `filePicker.select`, so unlike the CPU and VM
// emulators its picker never offered "Select local file". Fixed; kept as a
// regression test.
test(
  "Assembler file picker offers to select a local file",
  { tag: "@asm" },
  async ({ page }) => {
    await page.goto("asm");
    await page.locator('[data-tooltip="Load file"]').click();
    const dialog = page.locator("article.file-select");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Select local file" }),
    ).toBeVisible({ timeout: 2_000 });
  },
);
