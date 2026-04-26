import { expect } from "@playwright/test";
import { test } from "../../fixtures/chip.fixture";
import { RamChipPage } from "../../src/pages/RamChipPage";

const AND_HDL = `CHIP And {
    IN a, b;
    OUT out;

    PARTS:
    Nand(a=a, b=b, out=x);
    Not(in=x, out=out);
}`;

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

test("Learner builds combinational, bus, and sequential chips across projects 01 and 03", async ({
  chipPage,
}) => {
  // Act 1: combinational (project 01, And)
  await chipPage.selectProject("01");
  await chipPage.selectChip("And");
  await chipPage.fillHdlEditor(AND_HDL);

  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
  await chipPage.resetTest();

  await chipPage.setInput("a", 1);
  await chipPage.setInput("b", 1);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(1);

  await chipPage.setInput("b", 0);
  await chipPage.evalChip();
  expect(await chipPage.getOutput("out")).toBe(0);

  await chipPage.resetTest();
  await expect.poll(() => chipPage.getOutput("out")).toBe(0);

  // Act 2: bus (project 01, Mux16)
  await chipPage.selectProject("01");
  await chipPage.selectChip("Mux16");
  await chipPage.fillHdlEditor(MUX16_HDL);

  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
  await chipPage.resetTest();

  await chipPage.setBusInput("a", 0x1234);
  await chipPage.setBusInput("b", 0x5678);
  await chipPage.setInput("sel", 0);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0x1234);

  await chipPage.setInput("sel", 1);
  await chipPage.evalChip();
  expect(await chipPage.getBusOutput("out")).toBe(0x5678);

  // Act 3: sequential (project 03, RAM8)
  await chipPage.selectProject("03");
  await chipPage.selectChip("RAM8");
  await chipPage.enableBuiltin();
  await chipPage.resetTest();

  await chipPage.testPanel.runTest();
  expect(await chipPage.testPanel.getFailureCount()).toBe(0);
  await chipPage.resetTest();

  const ram = new RamChipPage(chipPage);
  await ram.write(0, 1111);
  await ram.write(7, 2222);

  await ram.read(0);
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(1111);

  await ram.read(7);
  await expect.poll(() => chipPage.getBusOutput("out")).toBe(2222);
});
