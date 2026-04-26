import { expect } from "@playwright/test";
import { TestPanel } from "../../src/pages/TestPanel";
import { test } from "../../fixtures/vm.fixture";

test(
  "Student loads SimpleAdd.vm and runs its VME.tst with zero failures",
  { tag: "@vm" },
  async ({ vmPage }) => {
    await vmPage.loadProjectFile("07", "SimpleAdd", "SimpleAdd.vm");

    const testPanel = new TestPanel(vmPage.page);
    await testPanel.runTest();

    expect(await testPanel.getFailureCount()).toBe(0);
  },
);
