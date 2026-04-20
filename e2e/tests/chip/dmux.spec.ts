import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const DMUX_HDL = `CHIP DMux {
    IN in, sel;
    OUT a, b;
    PARTS:
    Nand(a=sel, b=sel, out=ns);
    Nand(a=in, b=ns, out=ta);
    Nand(a=ta, b=ta, out=a);
    Nand(a=in, b=sel, out=tb);
    Nand(a=tb, b=tb, out=b);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("DMux");
});

test("DMux chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(DMUX_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("DMux chip evaluates correct output for all input combinations", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(DMUX_HDL);

  // Initial state: in=0, sel=0 → a=0, b=0
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(0);

  // DMux(1,0): a=1, b=0 — sel=0 routes to a
  await chipPage.setInput("in", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(1);
  expect(await chipPage.getOutput("b")).toBe(0);

  // DMux(1,1): a=0, b=1 — sel=1 routes to b
  await chipPage.setInput("sel", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(1);

  // DMux(0,1): a=0, b=0 — in=0 routes nothing
  await chipPage.setInput("in", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(0);
});

test("DMux chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("DMux chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(DMUX_HDL);

  // Set in=1, sel=0, eval → a=1, b=0
  await chipPage.setInput("in", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("a")).toBe(1);
  expect(await chipPage.getOutput("b")).toBe(0);

  // Reset: chip re-evals with in=0, sel=0 → a=0, b=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("a")).toBe(0);
  expect(await chipPage.getOutput("b")).toBe(0);
});
