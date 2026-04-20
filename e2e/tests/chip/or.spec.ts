import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const OR_HDL = `CHIP Or {
    IN a, b;
    OUT out;
    PARTS:
    Nand(a=a, b=a, out=na);
    Nand(a=b, b=b, out=nb);
    Nand(a=na, b=nb, out=out);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Or");
});

test("Or chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(OR_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Or chip evaluates correct output for all input combinations", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(OR_HDL);

  // Initial state after load: a=0, b=0, chip auto-evals → out=OR(0,0)=0
  expect(await chipPage.getOutput("out")).toBe(0);

  // OR(1, 0) = 1
  await chipPage.setInput("a", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // OR(1, 1) = 1
  await chipPage.setInput("b", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // OR(0, 1) = 1
  await chipPage.setInput("a", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);
});

test("Or chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Or chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(OR_HDL);

  // Set a=1, b=1, eval → out=1
  await chipPage.setInput("a", 1);
  await chipPage.setInput("b", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // Reset: chip re-evals with a=0, b=0 → out=OR(0,0)=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("out")).toBe(0);
});
