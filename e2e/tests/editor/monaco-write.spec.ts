import { expect, test } from "@playwright/test";
import { ChipPage } from "../../src/pages/ChipPage";
import { EditorPanel } from "../../src/pages/EditorPanel";

const AND_HDL = `CHIP And {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a, b=b, out=x);
    Not(in=x, out=out);
}`;

test("EditorPanel.write puts HDL into Monaco without mangling it", async ({
  page,
}) => {
  await page.goto("chip");
  const chipPage = new ChipPage(page);
  const editor = new EditorPanel(page);

  await chipPage.selectProject("01");
  await chipPage.selectChip("And");

  await editor.write(AND_HDL);
  expect(await editor.read()).toBe(AND_HDL);

  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});
