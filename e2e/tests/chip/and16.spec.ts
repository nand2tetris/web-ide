import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";

const AND16_HDL = `CHIP And16 {
    IN a[16], b[16];
    OUT out[16];
    PARTS:
    And(a=a[0],  b=b[0],  out=out[0]);
    And(a=a[1],  b=b[1],  out=out[1]);
    And(a=a[2],  b=b[2],  out=out[2]);
    And(a=a[3],  b=b[3],  out=out[3]);
    And(a=a[4],  b=b[4],  out=out[4]);
    And(a=a[5],  b=b[5],  out=out[5]);
    And(a=a[6],  b=b[6],  out=out[6]);
    And(a=a[7],  b=b[7],  out=out[7]);
    And(a=a[8],  b=b[8],  out=out[8]);
    And(a=a[9],  b=b[9],  out=out[9]);
    And(a=a[10], b=b[10], out=out[10]);
    And(a=a[11], b=b[11], out=out[11]);
    And(a=a[12], b=b[12], out=out[12]);
    And(a=a[13], b=b[13], out=out[13]);
    And(a=a[14], b=b[14], out=out[14]);
    And(a=a[15], b=b[15], out=out[15]);
}`;

test.beforeEach(async ({ chipPage }) => {
  await chipPage.selectProject("01");
  await chipPage.selectChip("And16");
});

test("And16 chip passes test script with HDL implementation", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(AND16_HDL);

  await chipPage.testPanel.runTest();

  const failures = await chipPage.testPanel.getFailureCount();
  expect(failures).toBe(0);
});

test("And16 chip evaluates correct output for bus inputs", async ({
  chipPage,
}) => {
  await chipPage.fillHdlEditor(AND16_HDL);

  // Initial state: a=0, b=0, AND(0,0) = 0
  expect(await chipPage.getBusOutput("out")).toBe(0);

  // AND(0xFFFF, 0xFFFF) = 0xFFFF = -1
  await chipPage.setBusInput("a", -1);
  await chipPage.setBusInput("b", -1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-1);

  // AND(0x0F0F, 0xFF00) = 0x0F00 = 3840; exercises byte-misaligned patterns
  // 0xFF00 = -256 in signed 16-bit; 0x0F00 = 3840
  await chipPage.setBusInput("a", 0x0f0f);
  await chipPage.setBusInput("b", -256);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0x0f00);
});

test("And16 chip shows syntax error for malformed HDL", async ({ chipPage }) => {
  await chipPage.fillHdlEditor("@@@NOT_VALID_HDL@@@");
  await expect(
    chipPage.page.getByText("Syntax errors in the HDL code or test"),
  ).toBeVisible();
});

test("And16 chip resets pins to default values", async ({ chipPage }) => {
  await chipPage.fillHdlEditor(AND16_HDL);

  // Set a=-1, b=-1, eval → out=-1
  await chipPage.setBusInput("a", -1);
  await chipPage.setBusInput("b", -1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(-1);

  // Reset: chip re-evals with a=0, b=0 → out=AND(0,0)=0
  await chipPage.resetTest();
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(0);
});
