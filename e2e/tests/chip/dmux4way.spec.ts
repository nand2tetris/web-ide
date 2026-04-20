import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const DMUX4WAY_HDL = `CHIP DMux4Way {
    IN in, sel[2];
    OUT a, b, c, d;
    PARTS:
    DMux(in=in, sel=sel[1], a=ab, b=cd);
    DMux(in=ab, sel=sel[0], a=a, b=b);
    DMux(in=cd, sel=sel[0], a=c, b=d);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("DMux4Way");
});

test("DMux4Way chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(DMUX4WAY_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("DMux4Way chip evaluates correct output for all sel values", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(DMUX4WAY_HDL);

  // Baseline: chip auto-evaluates on load with in=0, sel=0 → all outputs 0
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(0);
  expect(await chipPage.getOutput("c")).toBe(0);
  expect(await chipPage.getOutput("d")).toBe(0);

  // sel=0 (00): in → a
  await chipPage.setInput("in", 1);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(1);
  expect(await chipPage.getOutput("b")).toBe(0);
  expect(await chipPage.getOutput("c")).toBe(0);
  expect(await chipPage.getOutput("d")).toBe(0);

  // sel=1 (01): in → b
  await chipPage.setBusInput("sel", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(1);
  expect(await chipPage.getOutput("c")).toBe(0);
  expect(await chipPage.getOutput("d")).toBe(0);

  // sel=2 (10): in → c
  await chipPage.setBusInput("sel", 2);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(0);
  expect(await chipPage.getOutput("c")).toBe(1);
  expect(await chipPage.getOutput("d")).toBe(0);

  // sel=3 (11): in → d
  await chipPage.setBusInput("sel", 3);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(0);
  expect(await chipPage.getOutput("c")).toBe(0);
  expect(await chipPage.getOutput("d")).toBe(1);
});

test("DMux4Way chip shows syntax error for malformed HDL", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("DMux4Way chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(DMUX4WAY_HDL);

  // Set in=1, sel=0, eval → a=1
  await chipPage.setInput("in", 1);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(1);

  // Reset: all outputs return to 0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(0);
});
