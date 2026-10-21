import { expect, test } from "@playwright/test";

// Repro for #667 / #672 (and likely #674 / #677 / #680 on the bitmap page):
// GitHub Pages 301s /web-ide/chip -> /web-ide/chip/, and the Guide button calls
// window.open("user_guide/chip.pdf"), a relative URL, which then resolves to
// /web-ide/chip/user_guide/chip.pdf (404). Expected: /web-ide/user_guide/chip.pdf.
for (const tool of ["chip", "cpu", "asm", "vm", "compiler", "bitmap"]) {
  test(`guide button on /${tool}/ opens a URL under the app base`, async ({
    page,
  }) => {
    await page.goto(`${tool}/`);
    const popupPromise = page.waitForEvent("popup");
    await page.locator('[data-tooltip="Guide"]').click();
    const popup = await popupPromise;
    const url = new URL(popup.url());
    expect(url.pathname).toMatch(/^\/web-ide\/user_guide\/[a-z_]+\.pdf$/);
  });
}
