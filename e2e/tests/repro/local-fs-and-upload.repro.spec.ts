// Playwright repro SKETCHES (not run). Selectors are approximate.
import { expect, test } from "@playwright/test";

// #602: Assembler page offers no local-file upload / new file
test("#602 asm page: file picker offers 'Select local file'", async ({ page }) => {
  await page.goto("/web-ide/asm");
  await page.getByRole("button", { name: "📂" }).click(); // asm.tsx:63 uses filePicker.select (allowLocal=false)
  await expect(page.getByRole("button", { name: "Select local file" })).toBeVisible(); // expected to FAIL
});

// #599: zip downloaded from chip page (chip.tsx:205) cannot be re-imported
test("#599 chip page accepts a downloaded project zip", async ({ page }) => {
  await page.goto("/web-ide/chip");
  await page.getByRole("button", { name: "📂" }).click();
  await expect(page.getByRole("button", { name: "Select local file" })).toBeVisible(); // FAILS: chip uses select()
});

// #533: empty folder on compiler page (needs showDirectoryPicker stub returning empty dir)
test("#533 compiler accepts empty folder", async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).showDirectoryPicker = async () => ({
      name: "empty", kind: "directory",
      async *entries() {}, queryPermission: async () => "granted", requestPermission: async () => "granted",
    });
  });
  await page.goto("/web-ide/compiler");
  await page.getByRole("button", { name: /load|📂/i }).first().click();
  await expect(page.getByText("No .jack files in the selected folder")).toHaveCount(0); // FAILS (compiler.tsx:73)
});

// #592: stale handle with 'prompt' permission, then Ok in dialog
test("#592 permission prompt restores local fs", async ({ page }) => {
  // Needs a persisted handle in IndexedDB NAND2TetrisIndexedDB/FileSystemAccess/Handler across a reload;
  // headless Chromium cannot grant persistent FS permission - verify manually (see report).
  test.skip(true, "manual / needs real FS handle");
});
