import { expect } from "@playwright/test";
import { test } from "../../fixtures/vm.fixture";

const SIMPLE_ADD_VM = `push constant 7
push constant 8
add`;

test("Student types SimpleAdd, steps through it, runs it, and observes the result in RAM", {tag: "@vm"}, async ({
  vmPage,
}) => {
  await vmPage.editor.write(SIMPLE_ADD_VM, "vm");

  // Step through each of the three VM instructions and assert the
  // VM Structures panel reflects the working stack at each step.
  await vmPage.step();
  await expect(vmPage.vmStructures).toContainText("7");
  await vmPage.step();
  await expect(vmPage.vmStructures).toContainText("8");
  await vmPage.step();
  await expect(vmPage.vmStructures).toContainText("15");

  await vmPage.reset();
  await vmPage.run();
  await vmPage.waitForHalt();

  expect(await vmPage.readRam(0)).toBe(257);
  expect(await vmPage.readRam(256)).toBe(15);
  await expect(vmPage.page.getByText("Program halted")).toBeVisible();

  await vmPage.reset();
  await expect(vmPage.page.getByText("Program halted")).toBeHidden();
});
