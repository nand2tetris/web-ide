import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const XOR_HDL = `CHIP Xor {
    IN a, b;
    OUT out;
    PARTS:
    Nand(a=a, b=b, out=nab);
    Nand(a=a, b=nab, out=x);
    Nand(a=b, b=nab, out=y);
    Nand(a=x, b=y, out=out);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Xor");
});

test("Xor chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(XOR_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Xor chip evaluates correct output for all input combinations", { tag: "@smoke" }, async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(XOR_HDL);

  // Initial state after load: a=0, b=0, chip auto-evals → out=XOR(0,0)=0
  expect(await chipPage.getOutput("out")).toBe(0);

  // XOR(1, 0) = 1
  await chipPage.setInput("a", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // XOR(1, 1) = 0
  await chipPage.setInput("b", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(0);

  // XOR(0, 1) = 1
  await chipPage.setInput("a", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);
});

test("Xor chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Xor chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(XOR_HDL);

  // Set a=1, b=0, eval → out=1
  await chipPage.setInput("a", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // Reset: chip re-evals with a=0, b=0 → out=XOR(0,0)=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("out")).toBe(0);
});
