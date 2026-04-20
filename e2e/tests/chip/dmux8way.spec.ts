import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const DMUX8WAY_HDL = `CHIP DMux8Way {
    IN in, sel[3];
    OUT a, b, c, d, e, f, g, h;
    PARTS:
    DMux(in=in, sel=sel[2], a=abcd, b=efgh);
    DMux4Way(in=abcd, sel=sel[0..1], a=a, b=b, c=c, d=d);
    DMux4Way(in=efgh, sel=sel[0..1], a=e, b=f, c=g, d=h);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("DMux8Way");
});

test("DMux8Way chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(DMUX8WAY_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("DMux8Way chip evaluates correct output for representative sel values", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(DMUX8WAY_HDL);

  // Baseline: chip auto-evaluates on load with in=0, sel=0 → all outputs 0
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("h")).toBe(0);

  // sel=0 (000): in → a
  await chipPage.setInput("in", 1);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(1);
  expect(await chipPage.getOutput("h")).toBe(0);

  // sel=3 (011): in → d
  await chipPage.setBusInput("sel", 3);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("d")).toBe(1);
  expect(await chipPage.getOutput("a")).toBe(0);

  // sel=4 (100): in → e
  await chipPage.setBusInput("sel", 4);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("e")).toBe(1);
  expect(await chipPage.getOutput("d")).toBe(0);

  // sel=7 (111): in → h
  await chipPage.setBusInput("sel", 7);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("h")).toBe(1);
  expect(await chipPage.getOutput("e")).toBe(0);
});

test("DMux8Way chip shows syntax error for malformed HDL", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("DMux8Way chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(DMUX8WAY_HDL);

  // Set in=1, sel=0, eval → a=1
  await chipPage.setInput("in", 1);
  await chipPage.setBusInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(1);

  // Reset: all outputs return to 0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("h")).toBe(0);
});
