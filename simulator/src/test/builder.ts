import { checkExhaustive } from "@davidsouther/jiffies/lib/esm/assert.js";
import {
  Tst,
  TstLineStatement,
  TstOperation,
  TstStatement,
  TstWhileStatement,
} from "../languages/tst.js";
import {
  TestEvalInstruction,
  TestTickInstruction,
  TestTockInstruction,
} from "./chiptst.js";
import {
  Condition,
  TestClearEchoInstruction,
  TestCompoundInstruction,
  TestEchoInstruction,
  TestLoadROMInstruction,
  TestOutputInstruction,
  TestOutputListInstruction,
  TestRepeatInstruction,
  TestSetInstruction,
  TestWhileInstruction,
} from "./instruction.js";
import { Test } from "./tst.js";
import { TestVMStepInstruction } from "./vmtst.js";
import { TestTickTockInstruction } from "./cputst.js";

function isTstLineStatment(line: TstStatement): line is TstLineStatement {
  return (line as TstLineStatement).ops !== undefined;
}

function isTstWhileStatement(line: TstStatement): line is TstWhileStatement {
  return (line as TstWhileStatement).condition !== undefined;
}

function makeLineStatement(line: TstLineStatement) {
  const statement = new TestCompoundInstruction();
  statement.span = line.span;
  for (const op of line.ops) {
    const inst = makeInstruction(op);
    if (inst !== undefined) statement.addInstruction(inst);
  }
  return statement;
}

function makeInstruction(inst: TstOperation) {
  const { op } = inst;
  switch (op) {
    case "tick":
      return new TestTickInstruction();
    case "tock":
      return new TestTockInstruction();
    case "ticktock":
      return new TestTickTockInstruction();
    case "eval":
      return new TestEvalInstruction();
    case "vmstep":
      return new TestVMStepInstruction();
    case "output":
      return new TestOutputInstruction();
    case "set":
      return new TestSetInstruction(inst.id, inst.value, inst.index);
    case "output-list":
      return new TestOutputListInstruction(inst.spec);
    case "echo":
      return new TestEchoInstruction(inst.message);
    case "clear-echo":
      return new TestClearEchoInstruction();
    case "loadRom":
      return new TestLoadROMInstruction(inst.file);
    case "load":
    case "output-file":
    case "compare-to":
      return undefined;
    default:
      checkExhaustive(op, `Unknown tst operation ${op}`);
  }
}

export function fill<T extends Test>(test: T, tst: Tst): T {
  for (const line of tst.lines) {
    if (isTstLineStatment(line)) {
      test.addInstruction(makeLineStatement(line));
    } else {
      const repeat = isTstWhileStatement(line)
        ? new TestWhileInstruction(
            new Condition(
              line.condition.left,
              line.condition.right,
              line.condition.op
            )
          )
        : new TestRepeatInstruction(line.count);
      repeat.span = line.span;
      test.addInstruction(repeat);
      for (const statement of line.statements) {
        repeat.addInstruction(makeLineStatement(statement));
      }
    }
  }

  test.reset();

  return test;
}
