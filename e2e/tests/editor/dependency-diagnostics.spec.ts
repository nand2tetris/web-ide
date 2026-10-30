import { expect, test } from "@playwright/test";

test("dependency diagnostics leave the last HDL source line and cursor visible", async ({ page }) => {
  const source = [
    "CHIP Long { IN a; OUT out; PARTS:",
    ...Array.from({ length: 100 }, (_, i) => `// source line ${i}`),
    "Bad(a=a, out=out);",
    "}",
  ].join("\n");
  await page.addInitScript((hdl) => {
    localStorage.setItem("/projects/occlusion/Long.hdl", hdl);
    localStorage.setItem("/projects/occlusion/Bad.hdl", "CHIP Bad { IN a; OUT out; PARTS: Missing(a=a, out=out); }");
  }, source);
  await page.goto("chip");
  await page.selectOption('[data-testid="project-picker"]', "occlusion");
  await page.selectOption('[data-testid="chip-picker"]', { label: "Long" });

  const editor = page.locator("._hdl_panel .Editor");
  const dependencies = editor.locator(".dependency-diagnostics");
  await expect(dependencies).toContainText("Bad.hdl");
  const monaco = editor.locator(".monaco-editor");
  await monaco.click();
  await page.keyboard.press("Control+End");
  const lastLine = monaco.locator(".view-lines .view-line").last();
  await expect(lastLine).toHaveText("}");
  const cursor = monaco.locator(".cursors-layer .cursor").first();

  for (const visibleSource of [lastLine, cursor]) {
    await expect.poll(async () => {
      const sourceBox = await visibleSource.boundingBox();
      const panelBox = await dependencies.boundingBox();
      return sourceBox !== null && panelBox !== null && sourceBox.height > 0 && sourceBox.y + sourceBox.height <= panelBox.y + 1;
    }).toBe(true);
  }
});
