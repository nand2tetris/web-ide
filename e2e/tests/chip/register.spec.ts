import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("03");
  await chipPage.selectChip("Register");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();
});

test("Register passes test script", async ({ chipPage }) => {
  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
});

test("Register retains stored value when load is not asserted", async ({
  chipPage,
}) => {
  // load 12345 with load=1 → out becomes 12345
  await chipPage.setBusInput("in", 12345);
  await chipPage.setInput("load", 1);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getBusOutput("out")).toBe(12345);

  // in=0, load=0 → out retains 12345
  await chipPage.setBusInput("in", 0);
  await chipPage.setInput("load", 0);
  await chipPage.tickClock();
  await chipPage.tockClock();
  expect(await chipPage.getBusOutput("out")).toBe(12345);
});
