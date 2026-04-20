import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";
import { RamChipPage } from "../../src/pages/RamChipPage";

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("03");
  await chipPage.selectChip("RAM8");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();
});

test("RAM8 passes test script", async ({ chipPage }) => {
  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("RAM8 writes and reads distinct addresses", async ({ chipPage }) => {
  const ram = new RamChipPage(chipPage);
  await ram.write(3, 7777);
  await ram.write(5, 9999);

  expect(await ram.read(3)).toBe(7777);
  expect(await ram.read(5)).toBe(9999);
  expect(await ram.read(3)).toBe(7777);
});
