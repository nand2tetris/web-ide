import { test as base } from "@playwright/test";
import { ChipPage } from "../src/pages/ChipPage";

type ChipFixtures = {
  chipPage: ChipPage;
};

export const test = base.extend<ChipFixtures>({
  chipPage: async ({ page }, use) => {
    await page.goto("chip");
    const chipPage = new ChipPage(page);
    await chipPage.editor.disableMonaco();
    await use(chipPage);
  },
});
