import { describe, it, expect } from "@davidsouther/jiffies/scope/index.js";
import { Nand } from "./chip/builtins/logic/nand.js";
import { Output } from "./output.js";
import {
  ChipTest,
  TestSetInstruction,
  TestEvalInstruction,
  TestOutputInstruction,
  TestTickInstruction,
  TestTockInstruction,
} from "./tst.js";

describe("Simulator Test", () => {
  describe("Full tests", () => {
    it("creates a simulator test", () => {
      const test = new ChipTest().with(new Nand());
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

    it("tick tocks a clock", () => {
      const test = new ChipTest(); //.with(new DFF());
      test.outputList([new Output("time", "S", 4, 0, 0)]);
      for (let i = 0; i < 5; i++) {
        test.addInstruction(new TestTickInstruction());
        test.addInstruction(new TestOutputInstruction());
        test.addInstruction(new TestTockInstruction());
        test.addInstruction(new TestOutputInstruction());
      }
      for (let i = 0; i < 2; i++) {
        test.addInstruction(new TestEvalInstruction());
        test.addInstruction(new TestOutputInstruction());
      }
      for (let i = 0; i < 3; i++) {
        test.addInstruction(new TestTickInstruction());
        test.addInstruction(new TestTockInstruction());
        test.addInstruction(new TestOutputInstruction());
      }

      test.run();

      expect(test.log().trim().split("\n")).toEqual(
        [
          "0+",
          "1",
          "1+",
          "2",
          "2+",
          "3",
          "3+",
          "4",
          "4+",
          "5",
          "5",
          "5",
          "6",
          "7",
          "8",
        ].map((i) => `|${i.padEnd(4, " ")}|`)
      );
    });
  });
});
