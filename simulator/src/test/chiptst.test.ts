import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { Computer } from "../chip/builtins/computer/computer.js";
import { Nand } from "../chip/builtins/logic/nand.js";
import { TstRepeat } from "../languages/tst.js";
import {
  ChipTest,
  TestEvalInstruction,
  TestTickInstruction,
  TestTockInstruction,
} from "./chiptst.js";
import {
  TestCompoundInstruction,
  TestOutputInstruction,
  TestSetInstruction,
} from "./instruction.js";

describe("Chip Test", () => {
  describe("Builtins", () => {
    it("can set Memory", async () => {
      const computer = new Computer();
      const test = new ChipTest().with(computer);

      test.addInstruction(new TestSetInstruction("RAM16K", 0x1234, 2));
      await test.run();

      expect(computer.get("RAM16K", 2)?.busVoltage).toBe(0x1234);
    });

    it("can read memory", async () => {
      const computer = new Computer();
      const test = new ChipTest().with(computer);
      test.outputList([
        {
          id: "RAM16K",
          style: "D",
          len: 4,
          lpad: 0,
          rpad: 0,
          builtin: true,
          address: 2,
        },
      ]);

      test.addInstruction(new TestSetInstruction("RAM16K", 1234, 2));
      test.addInstruction(new TestOutputInstruction());
      await test.run();

      expect(test.log()).toEqual(`|1234|\n`);
    });
  });

  describe("Full tests", () => {
    it("creates a simulator test", async () => {
      const test = new ChipTest().with(new Nand());
      test.outputList(
        ["a", "b", "out"].map((v) => {
          return { id: v };
        }),
      );

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

      await test.run();
      expect(test.log()).toEqual(
        `| 0 | 0 | 1 |\n| 1 | 1 | 0 |\n| 1 | 0 | 1 |\n| 0 | 1 | 1 |\n`,
      );
    });

    it("tick tocks a clock", async () => {
      const test = new ChipTest(); //.with(new DFF());
      test.outputList([{ id: "time", style: "S", len: 4, lpad: 0, rpad: 0 }]);
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

      await test.run();

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
        ].map((i) => `|${i.padEnd(4, " ")}|`),
      );
    });

    it("tick tocks a clock with a repeat", async () => {
      const repeat: TstRepeat = {
        count: 5,
        statements: [
          {
            op: { op: "tick" },
            separator: ",",
            span: { start: 0, end: 27, line: 1 },
          },
          {
            op: { op: "output" },
            separator: ",",
            span: { start: 0, end: 27, line: 1 },
          },
          {
            op: { op: "tock" },
            separator: ",",
            span: { start: 0, end: 27, line: 1 },
          },
          {
            op: { op: "output" },
            separator: ";",
            span: { start: 0, end: 27, line: 1 },
          },
        ],
        span: {
          line: 1,
          start: 0,
          end: 27,
        },
      };

      const maybeTest = ChipTest.from(
        {
          lines: [repeat],
        },
        { requireLoad: false },
      );
      expect(maybeTest).toBeOk();
      const test = unwrap(maybeTest);
      test.outputList([{ id: "time", style: "S", len: 4, lpad: 0, rpad: 0 }]);

      await test.run();

      expect(test.log().trim().split("\n")).toEqual(
        ["0+", "1", "1+", "2", "2+", "3", "3+", "4", "4+", "5"].map(
          (i) => `|${i.padEnd(4, " ")}|`,
        ),
      );
    });
  });

  it("has a first step", () => {
    const test = new ChipTest(); //.with(new DFF());
    const statement = new TestSetInstruction("a", 1);
    test.addInstruction(statement);

    test.reset();

    expect(test.currentStep).toBeDefined();
  });
});
