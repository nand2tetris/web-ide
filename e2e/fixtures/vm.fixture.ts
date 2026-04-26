import { test as base } from "@playwright/test";
import { VmPage } from "../src/pages/VmPage";

type VmFixtures = {
  vmPage: VmPage;
};

export const test = base.extend<VmFixtures>({
  vmPage: async ({ page }, use) => {
    await page.goto("vm");
    const vmPage = new VmPage(page);
    await vmPage.editor.disableMonaco();
    await use(vmPage);
  },
});
