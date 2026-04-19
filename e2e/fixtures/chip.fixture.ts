import { test as base } from "@playwright/test";
import { ChipPage } from "../src/pages/ChipPage";

type ChipFixtures = {
  chipPage: ChipPage;
};

export const test = base.extend<ChipFixtures>({
  chipPage: async ({ page }, use) => {
    await page.goto("chip");
    await use(new ChipPage(page));
  },
});
