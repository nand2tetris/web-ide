import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const OR16_HDL = `CHIP Or16 {
    IN a[16], b[16];
    OUT out[16];
    PARTS:
    Or(a=a[0],  b=b[0],  out=out[0]);
    Or(a=a[1],  b=b[1],  out=out[1]);
    Or(a=a[2],  b=b[2],  out=out[2]);
    Or(a=a[3],  b=b[3],  out=out[3]);
    Or(a=a[4],  b=b[4],  out=out[4]);
    Or(a=a[5],  b=b[5],  out=out[5]);
    Or(a=a[6],  b=b[6],  out=out[6]);
    Or(a=a[7],  b=b[7],  out=out[7]);
    Or(a=a[8],  b=b[8],  out=out[8]);
    Or(a=a[9],  b=b[9],  out=out[9]);
    Or(a=a[10], b=b[10], out=out[10]);
    Or(a=a[11], b=b[11], out=out[11]);
    Or(a=a[12], b=b[12], out=out[12]);
    Or(a=a[13], b=b[13], out=out[13]);
    Or(a=a[14], b=b[14], out=out[14]);
    Or(a=a[15], b=b[15], out=out[15]);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Or16");
});

test("Or16 chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(OR16_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Or16 chip evaluates correct output for bus inputs", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(OR16_HDL);

  // Initial state: a=0, b=0, OR(0,0) = 0
  expect(await chipPage.getBusOutput("out")).toBe(0);

  // OR(0xFFFF, 0) = 0xFFFF = -1
  await chipPage.setBusInput("a", -1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-1);

  // OR(0x00FF, 0xFF00) = 0xFFFF = -1; 0xFF00 = -256 in signed 16-bit
  await chipPage.setBusInput("a", 0x00ff);
  await chipPage.setBusInput("b", -256);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-1);

  // OR(0x5555, 0xAAAA) = 0xFFFF = -1; 0xAAAA = -21846 in signed 16-bit
  await chipPage.setBusInput("a", 0x5555);
  await chipPage.setBusInput("b", -21846);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-1);

  // OR(0x1234, 0x2468) = 0x367C = 13948
  await chipPage.setBusInput("a", 0x1234);
  await chipPage.setBusInput("b", 0x2468);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0x367c);
});

test("Or16 chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Or16 chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(OR16_HDL);

  // Set a=-1, eval → out=-1
  await chipPage.setBusInput("a", -1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-1);

  // Reset: chip re-evals with a=0, b=0 → out=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(0);
});
