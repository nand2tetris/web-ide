import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const MUX16_HDL = `CHIP Mux16 {
    IN a[16], b[16], sel;
    OUT out[16];
    PARTS:
    Mux(a=a[0],  b=b[0],  sel=sel, out=out[0]);
    Mux(a=a[1],  b=b[1],  sel=sel, out=out[1]);
    Mux(a=a[2],  b=b[2],  sel=sel, out=out[2]);
    Mux(a=a[3],  b=b[3],  sel=sel, out=out[3]);
    Mux(a=a[4],  b=b[4],  sel=sel, out=out[4]);
    Mux(a=a[5],  b=b[5],  sel=sel, out=out[5]);
    Mux(a=a[6],  b=b[6],  sel=sel, out=out[6]);
    Mux(a=a[7],  b=b[7],  sel=sel, out=out[7]);
    Mux(a=a[8],  b=b[8],  sel=sel, out=out[8]);
    Mux(a=a[9],  b=b[9],  sel=sel, out=out[9]);
    Mux(a=a[10], b=b[10], sel=sel, out=out[10]);
    Mux(a=a[11], b=b[11], sel=sel, out=out[11]);
    Mux(a=a[12], b=b[12], sel=sel, out=out[12]);
    Mux(a=a[13], b=b[13], sel=sel, out=out[13]);
    Mux(a=a[14], b=b[14], sel=sel, out=out[14]);
    Mux(a=a[15], b=b[15], sel=sel, out=out[15]);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Mux16");
});

test("Mux16 chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX16_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Mux16 chip evaluates correct output for bus inputs", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX16_HDL);

  // Initial state: a=0, b=0, sel=0 → out=0
  expect(await chipPage.getBusOutput("out")).toBe(0);

  // sel=0 selects a
  await chipPage.setBusInput("a", 0x1234);
  await chipPage.setInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0x1234);

  // sel=1 selects b
  await chipPage.setBusInput("b", 0x5678);
  await chipPage.setInput("sel", 1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0x5678);

  // 0xAAAA = -21846 in signed 16-bit; sel=0 picks a
  await chipPage.setBusInput("a", -21846);
  await chipPage.setBusInput("b", 0x5555);
  await chipPage.setInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-21846);

  // same inputs, sel=1 picks b; 0x5555 = 21845 (positive)
  await chipPage.setInput("sel", 1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0x5555);
});

test("Mux16 chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Mux16 chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(MUX16_HDL);

  // Set a=1, sel=0, eval → out=1
  await chipPage.setBusInput("a", 0x0001);
  await chipPage.setInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(1);

  // Reset: chip re-evals with a=0, sel=0 → out=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(0);
});
