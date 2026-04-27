import { expect } from "@playwright/test";
import { vm as SIMPLE_ADD_VM } from "@nand2tetris/projects/project_07/11_simple_add.js";
import { TestPanel } from "../../src/pages/TestPanel";
import { test } from "../../fixtures/vm.fixture";

test(
  "Learner loads SimpleAdd, runs the test script, then steps through manually until halt",
  { tag: "@vm" },
  async ({ vmPage }) => {
    // Act 1: load SimpleAdd.vm and run the bundled VME.tst with zero failures
    await vmPage.loadProjectFile("07", "SimpleAdd", "SimpleAdd.vm");

    const testPanel = new TestPanel(vmPage.page);
    await testPanel.runTest();
    expect(await testPanel.getFailureCount()).toBe(0);

    // Act 2: reset, then re-fill the editor and step through manually
    await vmPage.reset();
    await vmPage.fillEditor(SIMPLE_ADD_VM);

    await vmPage.step();
    await expect(vmPage.vmStructures).toContainText("7");
    await vmPage.step();
    await expect(vmPage.vmStructures).toContainText("8");
    await vmPage.step();
    await expect(vmPage.vmStructures).toContainText("15");

    // Act 3: reset and run to completion; observe RAM and the halt banner
    await vmPage.reset();
    await vmPage.run();
    await vmPage.waitForHalt();

    expect(await vmPage.readRam(0)).toBe(257);
    expect(await vmPage.readRam(256)).toBe(15);

    await vmPage.reset();
    await vmPage.expectNotHalted();
  },
);
