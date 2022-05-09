import { describe, it, expect } from "@davidsouther/jiffies/scope/index.js";
import { Output } from "./output.js";
import {
  ChipTest,
  TestSetInstruction,
  TestEvalInstruction,
  TestOutputInstruction,
} from "./tst.js";

describe("Simulator Test", () => {
  it("creates a simulator test", () => {
    const test = new ChipTest();
    test.outputList(["a", "b", "out"].map((v) => new Output(v)));

    [
      new TestSetInstruction("a", 0),
      new TestSetInstruction("b", 0),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    [
      new TestSetInstruction("a", 1),
      new TestSetInstruction("b", 1),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    [
      new TestSetInstruction("a", 1),
      new TestSetInstruction("b", 0),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    [
      new TestSetInstruction("a", 0),
      new TestSetInstruction("b", 1),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    test.run();
    expect(test.log()).toEqual(
      `| 0 | 0 | 1 |\n| 1 | 1 | 0 |\n| 1 | 0 | 1 |\n| 0 | 1 | 1 |\n`
    );
  });
});
