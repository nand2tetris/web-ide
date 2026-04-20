import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const MUX_HDL = `CHIP Mux {
    IN a, b, sel;
    OUT out;
    PARTS:
    Nand(a=sel, b=sel, out=ns);
    Nand(a=a, b=ns, out=x);
    Nand(a=b, b=sel, out=y);
    Nand(a=x, b=y, out=out);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("Mux");
});

test("Mux chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("Mux chip evaluates correct output for representative inputs", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(MUX_HDL);

  // Initial state: a=0, b=0, sel=0 → out=Mux(0,0,0)=0 (sel=0 passes a)
  expect(await chipPage.getOutput("out")).toBe(0);

  // Mux(1,0,0)=1 — sel=0 passes a=1
  await chipPage.setInput("a", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // Mux(1,0,1)=0 — sel=1 passes b=0
  await chipPage.setInput("sel", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(0);

  // Mux(1,1,1)=1 — sel=1 passes b=1
  await chipPage.setInput("b", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);
});

test("Mux chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("Mux chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(MUX_HDL);

  // Set a=1, sel=0, eval → out=1 (sel=0 passes a=1)
  await chipPage.setInput("a", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  // Reset: chip re-evals with a=0, b=0, sel=0 → out=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("out")).toBe(0);
});
