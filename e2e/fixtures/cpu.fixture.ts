import { test as base } from "@playwright/test";
import { CpuPage } from "../src/pages/CpuPage";

type CpuFixtures = {
  cpuPage: CpuPage;
};

export const test = base.extend<CpuFixtures>({
  cpuPage: async ({ page }, use) => {
    await page.goto("cpu");
    await use(new CpuPage(page));
  },
});
