import { bin, dec, hex } from "../util/twos.js";

export abstract class Test<IS extends TestInstruction = TestInstruction> {
  protected readonly instructions: (IS | TestInstruction)[] = [];
  protected _outputList: Output[] = [];

  load(filename: string): void {}
  compareTo(filename: string): void {}
  outputFile(filename: string): void {}
  outputList(outputs: Output[]): void {}

  addInstruction(instruction: IS | TestInstruction) {
    this.instructions.push(instruction);
  }

  run() {
    for (const instruction of this.instructions) {
      instruction.do(this);
    }
  }

  echo(content: string) {}
  clearEcho() {}

  protected readonly breakpoints: Map<string, number> = new Map();
  addBreakpoint(variable: string, value: number) {
    this.breakpoints.set(variable, value);
  }
  clearBreakpoints() {
    this.breakpoints.clear();
  }

  output() {
    const values = this._outputList.map((output) => output.print(this));
    const output = `|${values.join("|")}|`;
  }

  abstract hasVar(variable: string | number): boolean;
  abstract getVar(variable: string | number): number;
  abstract setVar(variable: string, value: number): void;
}

export class ChipTest extends Test<ChipTestInstruction> {
  hasVar(variable: string | number): boolean {
    return false;
  }
  getVar(variable: string | number): number {
    return 0;
  }
  setVar(variable: string, value: number): void {}

  eval(): void {}
  tick(): void {}
  tock(): void {}
}

export class CPUTest extends Test<CPUTestInstruction> {
  hasVar(variable: string | number): boolean {
    return false;
  }
  getVar(variable: string | number): number {
    return 0;
  }
  setVar(variable: string, value: number): void {}
  ticktock(): void {}
}

export class VMTest extends Test<VMTestInstruction> {
  hasVar(variable: string | number): boolean {
    return false;
  }
  getVar(variable: string | number): number {
    return 0;
  }
  setVar(variable: string, value: number): void {}
  vmstep(): void {}
}

export class Output {
  private readonly fmt: "B" | "X" | "D" | "S";
  private readonly lPad: number;
  private readonly rPad: number;
  private readonly len: number;

  constructor(private variable: string, private format = "%B1.1.1") {
    const { fmt, lPad, rPad, len } = format.match(
      /^%(?<fmt>[BDXS])(?<lPad>\d+)\.(?<len>\d+)\.(?<rPad>\d+)$/
    )?.groups as {
      fmt: "B" | "X" | "D" | "S";
      lPad: string;
      rPad: string;
      len: string;
    };
    this.fmt = fmt;
    this.lPad = parseInt(lPad);
    this.rPad = parseInt(rPad);
    this.len = parseInt(len);
  }

  header(test: Test) {
    return this.pad(this.variable);
  }

  print(test: Test) {
    const val = test.getVar(this.variable);
    const fmt = { B: bin, D: dec, X: hex, S: (i: number) => `${i}` }[this.fmt];
    let value = fmt(val);
    return this.pad(value);
  }

  private pad(val: string) {
    let value = val.slice(0, this.len);
    value = value.padStart(this.lPad + this.len);
    value = value.padEnd(this.lPad + this.len + this.rPad);
    return value;
  }
}

export interface TestInstruction {
  do(test: Test): void;
}

export class TestSetInstruction implements TestInstruction {
  constructor(private variable: string, private value: number) {}
  do(test: Test): void {
    test.setVar(this.variable, this.value);
  }
}

export class TestOutputInstruction implements TestInstruction {
  do(test: Test): void {
    test.output();
  }
}

export abstract class CompoundTestInstruction implements TestInstruction {
  protected readonly instructions: TestInstruction[] = [];

  addInstruction(instruction: TestInstruction) {
    this.instructions.push(instruction);
  }

  abstract do(test: Test): void;
}

export class TestRepeatInstruction extends CompoundTestInstruction {
  constructor(public readonly repeat: number) {
    super();
  }

  do(test: Test): void {
    for (let i = 0; i < this.repeat; i++) {
      for (const instruction of this.instructions) {
        instruction.do(test);
      }
    }
  }
}

export class Condition {
  constructor(
    public readonly x: string | number,
    public readonly y: string | number,
    public readonly op: "<" | "<=" | "=" | ">=" | ">" | "<>"
  ) {}

  check(test: Test): boolean {
    const x = test.hasVar(this.x) ? test.getVar(this.x) : this.x;
    const y = test.hasVar(this.y) ? test.getVar(this.y) : this.y;

    if (typeof x === "string" || typeof y === "string") {
      switch (this.op) {
        case "=":
          return `${x}` === `${y}`;
        case "<>":
          return `${x}` != `${y}`;
      }
    } else {
      switch (this.op) {
        case "<":
          return x < y;
        case "<=":
          return x <= y;
        case ">":
          return x > y;
        case ">=":
          return x >= y;
        case "=":
          return x === y;
        case "<>":
          return x != y;
      }
    }
    return false;
  }
}

export class TestWhileInstruction extends CompoundTestInstruction {
  constructor(public readonly condition: Condition) {
    super();
  }

  do(test: Test): void {
    while (this.condition.check(test)) {
      for (const instruction of this.instructions) {
        instruction.do(test);
      }
    }
  }
}

export class TestEchoInstruction implements TestInstruction {
  constructor(public readonly content: string) {}
  do(test: Test) {
    test.echo(this.content);
  }
}

export class TestClearEchoInstruction implements TestInstruction {
  do(test: Test) {
    test.clearEcho();
  }
}

export class TestBreakpointInstruction implements TestInstruction {
  constructor(
    public readonly variable: string,
    public readonly value: number
  ) {}

  do(test: Test) {
    test.addBreakpoint(this.variable, this.value);
  }
}

export class TestClearBreakpointsInstruction implements TestInstruction {
  do(test: Test) {
    test.clearBreakpoints();
  }
}

export interface ChipTestInstruction extends TestInstruction {
  _chipTestInstruction_: true;
  do(test: ChipTest): void;
}

export class TestEvalInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest): void {
    test.eval();
  }
}

export class TestTickInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest): void {
    test.tick();
  }
}

export class TestTockInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest): void {
    test.tock();
  }
}

export interface CPUTestInstruction extends TestInstruction {
  _cpuTestInstruction_: true;
  do(test: CPUTest): void;
}

export class TestTickTockInstruction implements CPUTestInstruction {
  readonly _cpuTestInstruction_ = true;
  do(test: CPUTest) {
    test.ticktock();
  }
}

export interface VMTestInstruction extends TestInstruction {
  _vmTestInstruction_: true;
  do(test: VMTest): void;
}

export class TestVMStepInstruction implements VMTestInstruction {
  readonly _vmTestInstruction_ = true;
  do(test: VMTest) {
    test.vmstep();
  }
}
