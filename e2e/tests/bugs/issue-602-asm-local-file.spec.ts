import { expect, test } from "@playwright/test";

// https://github.com/nand2tetris/web-ide/issues/602
// The Assembler's "Load file" opens the picker with `filePicker.select` (asm.tsx),
// while the CPU and VM emulators use `selectAllowLocal`, so the picker never
// offers "Select local file" on the Assembler page.
test(
  "Assembler file picker offers to select a local file",
  { tag: "@bug" },
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
