import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const MUX4WAY16_HDL = `CHIP Mux4Way16 {
    IN a[16], b[16], c[16], d[16], sel[2];
    OUT out[16];
    PARTS:
    Mux16(a=a, b=b, sel=sel[0], out=ab);
    Mux16(a=c, b=d, sel=sel[0], out=cd);
    Mux16(a=ab, b=cd, sel=sel[1], out=out);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Mux4Way16");
});

test("Mux4Way16 chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX4WAY16_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Mux4Way16 chip evaluates correct output for all sel values", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX4WAY16_HDL);

  // sel=0 (00): out=a
  await chipPage.setBusInput("a", 1);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(1);

  // sel=1 (01): out=b
  await chipPage.setBusInput("b", 2);
  await chipPage.setBusInput("sel", 1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(2);

  // sel=2 (10): out=c
  await chipPage.setBusInput("c", 3);
  await chipPage.setBusInput("sel", 2);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(3);

  // sel=3 (11): out=d
  await chipPage.setBusInput("d", 4);
  await chipPage.setBusInput("sel", 3);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(4);
});

test("Mux4Way16 chip shows syntax error for malformed HDL", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Mux4Way16 chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(MUX4WAY16_HDL);

  // Set a=1, sel=0, eval → out=1
  await chipPage.setBusInput("a", 0x0001);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(1);

  // Reset: chip re-evals with a=0, sel=0 → out=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(0);
});
