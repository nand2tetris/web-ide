import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

test("And chip passes built-in test script with no comparison failures", async ({
  chipPage,
}) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("And");

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});
