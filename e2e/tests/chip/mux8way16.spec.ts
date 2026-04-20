import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const MUX8WAY16_HDL = `CHIP Mux8Way16 {
    IN a[16], b[16], c[16], d[16],
       e[16], f[16], g[16], h[16], sel[3];
    OUT out[16];
    PARTS:
    Mux4Way16(a=a, b=b, c=c, d=d, sel=sel[0..1], out=abcd);
    Mux4Way16(a=e, b=f, c=g, d=h, sel=sel[0..1], out=efgh);
    Mux16(a=abcd, b=efgh, sel=sel[2], out=out);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Mux8Way16");
});

test("Mux8Way16 chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX8WAY16_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Mux8Way16 chip evaluates correct output for representative sel values", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX8WAY16_HDL);

  // sel=0 (000): out=a
  await chipPage.setBusInput("a", 10);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(10);

  // sel=4 (100): out=e
  await chipPage.setBusInput("e", 50);
  await chipPage.setBusInput("sel", 4);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(50);

  // sel=7 (111): out=h
  await chipPage.setBusInput("h", 99);
  await chipPage.setBusInput("sel", 7);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(99);
});

test("Mux8Way16 chip shows syntax error for malformed HDL", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Mux8Way16 chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(MUX8WAY16_HDL);

  // Set a=1, sel=0, eval → out=1
  await chipPage.setBusInput("a", 1);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(1);

  // Reset: chip re-evals with a=0, sel=0 → out=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(0);
});
