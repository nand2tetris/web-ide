import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

test("Not chip passes built-in test script with no comparison failures", async ({
  chipPage,
}) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Not");

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});
