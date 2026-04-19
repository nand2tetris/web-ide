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

test("Not chip evaluates correct output for all input combinations", async ({
  chipPage,
}) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Not");

  // Initial state after load: in=0, chip auto-evals → out=NOT(0)=1
  expect(await chipPage.getOutput("out")).toBe(1);

  // NOT(1) = 0
  await chipPage.setInput("in", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(0);

  // NOT(0) = 1
  await chipPage.setInput("in", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);
});

test("Not chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Not");
  await chipPage.disableBuiltin();
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Not chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Not");

  // Set in=1, eval → out=0
  await chipPage.setInput("in", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(0);

  // Reset: chip re-evals with in=0 → out=NOT(0)=1
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("out")).toBe(1);
});
