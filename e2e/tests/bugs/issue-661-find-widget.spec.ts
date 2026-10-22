import { expect, test } from "@playwright/test";

// https://github.com/nand2tetris/web-ide/issues/661
// Pico's global `[role=button]` rule matches Monaco's find-widget buttons (they
// are `div[role=button]`), giving them Pico's primary background, border and
// padding. The reporter could not close the widget by clicking its "x".
async function openFindWidget(page: import("@playwright/test").Page) {
  await page.goto("chip");
  await page.locator(".monaco-editor").first().click();
  await page.keyboard.press("ControlOrMeta+f");
  const widget = page.locator(".monaco-editor .find-widget.visible");
  await expect(widget).toBeVisible();
  return widget;
}

test(
  "Monaco find widget buttons are not restyled by Pico",
  { tag: "@bug" },
  async ({ page }) => {
    const widget = await openFindWidget(page);
    const close = widget.locator(".codicon-widget-close");
    await expect(close).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(close).toHaveCSS("border-top-width", "0px");
  },
);

test(
  "Monaco find widget closes when its x button is clicked",
  { tag: "@bug" },
  async ({ page }) => {
    const widget = await openFindWidget(page);
    await widget.locator(".codicon-widget-close").click({ timeout: 5_000 });
    await expect(widget).toBeHidden();
  },
);
