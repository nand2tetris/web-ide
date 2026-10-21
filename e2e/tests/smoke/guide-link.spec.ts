import { expect, test } from "@playwright/test";

// Regression test for #667 / #672. The Guide button must open the PDF under
// the app base URL, not relative to the current page: GitHub Pages redirects
// /web-ide/chip to /web-ide/chip/, which broke relative links.
for (const tool of ["chip", "cpu", "asm", "vm", "compiler", "bitmap"]) {
  test(`guide button on /${tool}/ opens a URL under the app base`, async ({
    page,
  }) => {
    // Record the URL passed to window.open rather than waiting on a popup,
    // whose url() is empty until it commits (and a PDF may download instead).
    await page.addInitScript(() => {
      (window as unknown as { opened?: string }).opened = undefined;
      window.open = (url?: string | URL) => {
        (window as unknown as { opened?: string }).opened = String(url);
        return null;
      };
    });
    await page.goto(`${tool}/`);
    await page.locator('[data-tooltip="Guide"]').click();
    const opened = await page.evaluate(
      () => (window as unknown as { opened?: string }).opened,
    );
    expect(opened).toBeDefined();
    const url = new URL(opened as string, page.url());
    expect(url.pathname).toMatch(/^\/web-ide\/user_guide\/[a-z_]+\.pdf$/);
  });
}
