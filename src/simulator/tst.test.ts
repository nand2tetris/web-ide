import { TstRepeat } from "../languages/tst";
import { Nand } from "./chip/builtins/logic/nand";
import { Output } from "./output";
import {
  ChipTest,
  TestSetInstruction,
  TestEvalInstruction,
  TestOutputInstruction,
  TestTickInstruction,
  TestTockInstruction,
  TestCompoundInstruction,
} from "./tst";

describe("Simulator Test", () => {
  describe("Full tests", () => {
    it("creates a simulator test", () => {
      const test = new ChipTest().with(new Nand());
      test.outputList(["a", "b", "out"].map((v) => new Output(v)));

      let statement: TestCompoundInstruction;
      statement = new TestCompoundInstruction();
      test.addInstruction(statement);
      [
        new TestSetInstruction("a", 0),
        new TestSetInstruction("b", 0),
        new TestEvalInstruction(),
        new TestOutputInstruction(),
      ].forEach((i) => statement.addInstruction(i));

      statement = new TestCompoundInstruction();
      test.addInstruction(statement);
      [
        new TestSetInstruction("a", 1),
        new TestSetInstruction("b", 1),
        new TestEvalInstruction(),
        new TestOutputInstruction(),
      ].forEach((i) => statement.addInstruction(i));

      statement = new TestCompoundInstruction();
      test.addInstruction(statement);
      [
        new TestSetInstruction("a", 1),
        new TestSetInstruction("b", 0),
        new TestEvalInstruction(),
        new TestOutputInstruction(),
      ].forEach((i) => statement.addInstruction(i));

      statement = new TestCompoundInstruction();
      test.addInstruction(statement);
      [
        new TestSetInstruction("a", 0),
        new TestSetInstruction("b", 1),
        new TestEvalInstruction(),
        new TestOutputInstruction(),
      ].forEach((i) => statement.addInstruction(i));

      test.run();
      expect(test.log()).toEqual(
        `| 0 | 0 | 1 |\n| 1 | 1 | 0 |\n| 1 | 0 | 1 |\n| 0 | 1 | 1 |\n`
      );
    });

    it("tick tocks a clock", () => {
      const test = new ChipTest(); //.with(new DFF());
      test.outputList([new Output("time", "S", 4, 0, 0)]);
      for (let i = 0; i < 5; i++) {
        const statement = new TestCompoundInstruction();
        test.addInstruction(statement);
        statement.addInstruction(new TestTickInstruction());
        statement.addInstruction(new TestOutputInstruction());
        statement.addInstruction(new TestTockInstruction());
        statement.addInstruction(new TestOutputInstruction());
      }
      for (let i = 0; i < 2; i++) {
        const statement = new TestCompoundInstruction();
        test.addInstruction(statement);
        statement.addInstruction(new TestEvalInstruction());
        statement.addInstruction(new TestOutputInstruction());
      }
      for (let i = 0; i < 3; i++) {
        const statement = new TestCompoundInstruction();
        test.addInstruction(statement);
        statement.addInstruction(new TestTickInstruction());
        statement.addInstruction(new TestTockInstruction());
        statement.addInstruction(new TestOutputInstruction());
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

    it("tick tocks a clock with a repeat", () => {
      const repeat: TstRepeat = {
        count: 5,
        statements: [
          {
            ops: [
              { op: "tick" },
              { op: "output" },
              { op: "tock" },
              { op: "output" },
            ],
          },
        ],
      };

      const test = ChipTest.from({ lines: [repeat] });
      test.outputList([new Output("time", "S", 4, 0, 0)]);

      test.run();

      expect(test.log().trim().split("\n")).toEqual(
        ["0+", "1", "1+", "2", "2+", "3", "3+", "4", "4+", "5"].map(
          (i) => `|${i.padEnd(4, " ")}|`
        )
      );
    });
  });
});
