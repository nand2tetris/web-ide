import { expect, type Page, test } from "@playwright/test";

// https://github.com/nand2tetris/web-ide/issues/661
//
// Reproduction: hovering the find widget's close "x" makes Monaco show its own
// "Close (Escape)" hover popover (`.context-view > .monaco-hover`). The popover
// is placed above the button, but the editor container is narrow, so the label
// wraps to two lines after Monaco measured one and the popover grows downward
// over the button. The popover is `pointer-events: auto`, so it intercepts the
// click and the widget cannot be closed.
async function openFindWidget(page: Page) {
  await page.goto("chip");
  await page.locator(".monaco-editor").first().click();
  await page.keyboard.press("ControlOrMeta+f");
  const widget = page.locator(".monaco-editor .find-widget.visible");
  await expect(widget).toBeVisible();
  return widget;
}

test(
  "Monaco find widget closes when its x button is clicked after hovering it",
  async ({ page }) => {
    const widget = await openFindWidget(page);
    const close = widget.locator(".codicon-widget-close");

    // Hover the "x": Monaco shows its tooltip popover after a short delay.
    await close.hover();
    const popover = page.locator(".monaco-hover", {
      hasText: "Close (Escape)",
    });
    await expect(popover).toBeVisible();

    // The pointer must still reach the button: the popover must not sit on it.
    const box = (await close.boundingBox())!;
    const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await expect
      .poll(() =>
        page.evaluate(
          ({ x, y }) => document.elementFromPoint(x, y)?.className ?? "",
          center,
        ),
      )
      .toContain("codicon-widget-close");

    await close.click({ timeout: 5_000 });
    await expect(widget).toBeHidden();
  },
);

// Separate, still-open defect: Pico's global `[role=button]` rule matches the
// widget's `div[role=button]` buttons and gives them Pico's primary background
// and border. It is cosmetic and does not block the click (the click test above
// fails with this styling neutralised too), so it stays a known bug.
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
