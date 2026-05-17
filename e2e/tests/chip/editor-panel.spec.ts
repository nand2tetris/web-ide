import { expect, test as base } from "@playwright/test";
import { ChipPage } from "../../src/pages/ChipPage";

const test = base.extend<{ chipPage: ChipPage }>({
  chipPage: async ({ page }, use) => {
    await page.goto("chip");
    const chipPage = new ChipPage(page);
    await chipPage.editor.disableMonaco();
    await use(chipPage);
  },
});

const AND_HDL = `CHIP And {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a, b=b, out=x);
    Not(in=x, out=out);
}`;

test("fillHdlEditor works after fixture disables Monaco via settings UI", async ({
  chipPage,
}) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("And");

  await expect(chipPage.editor.monacoEditor).not.toBeVisible();

  await chipPage.fillHdlEditor(AND_HDL);
  await chipPage.testPanel.runTest();

  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("toggleMonaco re-enables Monaco editor for tests that need it", async ({
  chipPage,
}) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("And");

  await chipPage.editor.enableMonaco();
  await expect(chipPage.editor.monacoEditor).toBeVisible();

  await chipPage.editor.write(AND_HDL, "hdl");
  await chipPage.testPanel.runTest();

  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});
