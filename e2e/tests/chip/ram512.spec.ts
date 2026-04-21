import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";
import { RamChipPage } from "../../src/pages/RamChipPage";

const MID = 255;
const MAX = 511;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("03");
  await chipPage.selectChip("RAM512");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();
});

test("RAM512 passes test script", async ({ chipPage }) => {
  test.setTimeout(60_000);
  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("RAM512 writes and reads distinct addresses", async ({ chipPage }) => {
  const ram = new RamChipPage(chipPage);
  await ram.write(0, 1111);
  await ram.write(MID, 2222);
  await ram.write(MAX, 3333);

  expect(await ram.read(0)).toBe(1111);
  expect(await ram.read(MID)).toBe(2222);
  expect(await ram.read(MAX)).toBe(3333);

  expect(await ram.read(0)).toBe(1111);
});
