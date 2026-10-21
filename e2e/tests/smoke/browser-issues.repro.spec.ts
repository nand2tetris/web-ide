// Repro sketches (not run). #661 Monaco find widget close, #675 symbol table scroll,
// #679 caret blinking, #671 garbled l10n.
import { expect, test } from "@playwright/test";

test("#661 Monaco find widget close button is visible/clickable", async ({ page }) => {
  await page.goto("chip");
  await page.locator(".monaco-editor").first().click();
  await page.keyboard.press("Control+f");
  const close = page.locator(".monaco-editor .find-widget .codicon-widget-close");
  await expect(close).toBeVisible();
  // Pico `[role=button]` padding/border enlarges Monaco's div[role=button] controls.
  const box = await close.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(30);
  await close.click();
  await expect(page.locator(".monaco-editor .find-widget.visible")).toHaveCount(0);
});

test("#675 asm symbol table scrolls with many labels", async ({ page }) => {
  await page.goto("asm");
  const src = Array.from({ length: 200 }, (_, i) => `(L${i})\n@L${i}\n0;JMP`).join("\n");
  await page.locator(".monaco-editor").first().click();
  await page.keyboard.press("Control+a");
  await page.keyboard.insertText(src);
  await page.getByRole("button", { name: /step|run|translate/i }).first().click();
  const main = page.locator("article.panel.sym > main");
  const { sh, ch } = await main.evaluate((e) => ({ sh: e.scrollHeight, ch: e.clientHeight }));
  expect(sh).toBeGreaterThan(ch); // content overflows...
  // ...but article.panel.editor { overflow-y: hidden } => nothing can scroll:
  const ov = await page.locator("article.panel.sym").evaluate((e) => getComputedStyle(e).overflowY);
  expect(ov).not.toBe("hidden");
});

test("#671/#681 no hashed message ids rendered", async ({ page }) => {
  await page.goto("");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/\b[A-Za-z0-9+/]{6}\b(?=\s*$)/m); // heuristic: lone 6-char ids
});
