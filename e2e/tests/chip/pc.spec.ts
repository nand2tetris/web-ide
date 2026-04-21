import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("03");
  await chipPage.selectChip("PC");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();
});

test("PC passes test script", async ({ chipPage }) => {
  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("PC increments, loads, and resets", async ({ chipPage }) => {
  // inc=1 → out increments to 1
  await chipPage.setInput("inc", 1);
  await chipPage.setInput("load", 0);
  await chipPage.setInput("reset", 0);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getBusOutput("out")).toBe(1);

  // load=1, in=100 → out loads to 100
  await chipPage.setInput("inc", 0);
  await chipPage.setInput("load", 1);
  await chipPage.setBusInput("in", 100);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getBusOutput("out")).toBe(100);

  // reset=1 → out resets to 0
  await chipPage.setInput("load", 0);
  await chipPage.setInput("reset", 1);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getBusOutput("out")).toBe(0);
});
