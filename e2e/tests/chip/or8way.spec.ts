import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const OR8WAY_HDL = `CHIP Or8Way {
    IN in[8];
    OUT out;
    PARTS:
    Or(a=in[0], b=in[1], out=o01);
    Or(a=o01,   b=in[2], out=o012);
    Or(a=o012,  b=in[3], out=o0123);
    Or(a=o0123, b=in[4], out=o01234);
    Or(a=o01234,b=in[5], out=o012345);
    Or(a=o012345,b=in[6],out=o0123456);
    Or(a=o0123456,b=in[7],out=out);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Or8Way");
});

test("Or8Way chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(OR8WAY_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Or8Way chip evaluates correct output for bus inputs", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(OR8WAY_HDL);

  // Initial state: in=0 → out=0
  expect(await chipPage.getOutput("out")).toBe(0);

  // Only bit 0 set
  await chipPage.setBusInput("in", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // Only bit 7 set; 0x80 = -128 in signed 8-bit
  await chipPage.setBusInput("in", -128);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // Alternating bits 0,2,4,6
  await chipPage.setBusInput("in", 0x55);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // All bits set; 0xFF = -1 in signed 8-bit
  await chipPage.setBusInput("in", -1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);
});

test("Or8Way chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Or8Way chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(OR8WAY_HDL);

  // Set in=0x80 (-128 in signed 8-bit), eval → out=1
  await chipPage.setBusInput("in", -128);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // Reset: chip re-evals with in=0 → out=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("out")).toBe(0);
});
