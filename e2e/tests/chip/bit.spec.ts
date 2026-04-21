import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("03");
  await chipPage.selectChip("Bit");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();
});

test("Bit passes test script", async ({ chipPage }) => {
  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("Bit retains stored value when load is not asserted", async ({
  chipPage,
}) => {
  // in=0, load=0 → out stays 0
  await chipPage.setInput("in", 0);
  await chipPage.setInput("load", 0);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getOutput("out")).toBe(0);

  // in=1, load=1 → out becomes 1
  await chipPage.setInput("in", 1);
  await chipPage.setInput("load", 1);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getOutput("out")).toBe(1);

  // in=0, load=0 → out retains 1
  await chipPage.setInput("in", 0);
  await chipPage.setInput("load", 0);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getOutput("out")).toBe(1);
});
