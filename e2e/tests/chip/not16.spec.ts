import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const NOT16_HDL = `CHIP Not16 {
    IN in[16];
    OUT out[16];
    PARTS:
    Not(in=in[0],  out=out[0]);
    Not(in=in[1],  out=out[1]);
    Not(in=in[2],  out=out[2]);
    Not(in=in[3],  out=out[3]);
    Not(in=in[4],  out=out[4]);
    Not(in=in[5],  out=out[5]);
    Not(in=in[6],  out=out[6]);
    Not(in=in[7],  out=out[7]);
    Not(in=in[8],  out=out[8]);
    Not(in=in[9],  out=out[9]);
    Not(in=in[10], out=out[10]);
    Not(in=in[11], out=out[11]);
    Not(in=in[12], out=out[12]);
    Not(in=in[13], out=out[13]);
    Not(in=in[14], out=out[14]);
    Not(in=in[15], out=out[15]);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Not16");
});

test("Not16 chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(NOT16_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Not16 chip evaluates correct output for bus inputs", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(NOT16_HDL);

  // Initial state: in=0, NOT(0x0000) = 0xFFFF = -1 in signed 16-bit
  expect(await chipPage.getBusOutput("out")).toBe(-1);

  // NOT(0xFFFF) = 0x0000 = 0
  await chipPage.setBusInput("in", -1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0);

  // NOT(0x00FF) = 0xFF00 = -256 in signed 16-bit
  await chipPage.setBusInput("in", 0x00ff);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-256);
});

test("Not16 chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Not16 chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(NOT16_HDL);

  // Set in=-1, eval → out=0
  await chipPage.setBusInput("in", -1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0);

  // Reset: chip re-evals with in=0 → out=NOT(0)=-1
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(-1);
});
