import { describe, it, expect } from "@jefri/jiffies/scope/index.js";
import {
  ChipTest,
  Output,
  TestSetInstruction,
  TestEvalInstruction,
  TestOutputInstruction,
} from "./test.js";

describe("Simulator Test", () => {
  it("creates a simulator test", () => {
    const test = new ChipTest();
    test.load("Eq3.hdl");
    test.outputFile("Eq3.out");
    test.compareTo("Eq3.cmp");
    test.outputList(["a", "b", "c", "out"].map((v) => new Output(v)));

    [
      new TestSetInstruction("a", 0),
      new TestSetInstruction("b", 0),
      new TestSetInstruction("c", 0),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    [
      new TestSetInstruction("a", 1),
      new TestSetInstruction("b", 1),
      new TestSetInstruction("c", 1),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    [
      new TestSetInstruction("a", 1),
      new TestSetInstruction("b", 0),
      new TestSetInstruction("c", 0),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    [
      new TestSetInstruction("a", 1),
      new TestSetInstruction("b", 0),
      new TestSetInstruction("c", 1),
      new TestEvalInstruction(),
      new TestOutputInstruction(),
    ].forEach((i) => test.addInstruction(i));

    test.run();
    //expect(test.)
  });
});
