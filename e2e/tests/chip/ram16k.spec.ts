import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";
import { RamChipPage } from "../../src/pages/RamChipPage";

const MID = 8191;
const MAX = 16383;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("03");
  await chipPage.selectChip("RAM16K");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();
});

test("RAM16K passes test script", async ({ chipPage }) => {
  test.setTimeout(30_000);
  await chipPage.testPanel.runTest({ stuckTimeoutMs: 15_000 });
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("RAM16K writes and reads distinct addresses", async ({ chipPage }) => {
  const ram = new RamChipPage(chipPage);
  await ram.write(0, 1111);
  await ram.write(MID, 2222);
  await ram.write(MAX, 3333);

  expect(await ram.read(0)).toBe(1111);
  expect(await ram.read(MID)).toBe(2222);
  expect(await ram.read(MAX)).toBe(3333);

  expect(await ram.read(0)).toBe(1111);
});
