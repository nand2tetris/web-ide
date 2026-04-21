import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";
import { RamChipPage } from "../../src/pages/RamChipPage";

const MID = 2047;
const MAX = 4095;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("03");
  await chipPage.selectChip("RAM4K");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();
});

test("RAM4K passes test script", async ({ chipPage }) => {
  test.setTimeout(60_000);
  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("RAM4K writes and reads distinct addresses", async ({ chipPage }) => {
  const ram = new RamChipPage(chipPage);
  await ram.write(0, 1111);
  await ram.write(MID, 2222);
  await ram.write(MAX, 3333);

  expect(await ram.read(0)).toBe(1111);
  expect(await ram.read(MID)).toBe(2222);
  expect(await ram.read(MAX)).toBe(3333);

  expect(await ram.read(0)).toBe(1111);
});
