import { expect, test } from "@playwright/test";

// Regression test for #667 / #672. The Guide button must open the PDF under
// the app base URL, not relative to the current page: GitHub Pages redirects
// /web-ide/chip to /web-ide/chip/, which broke relative links.
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
