import { Span } from "../languages/base.js";
import { TstOutputSpec } from "../languages/tst.js";
import { Test } from "./tst.js";

export interface TestInstruction {
  span?: Span;
  do(test: Test): void;
  steps(test: Test): IterableIterator<TestInstruction>;
}

export class TestSetInstruction implements TestInstruction {
  constructor(
    private variable: string,
    private value: number,
    private index?: number | undefined
  ) {}

  do(test: Test) {
    test.setVar(this.variable, this.value, this.index);
  }

  *steps() {
    yield this;
  }
}

export class TestOutputInstruction implements TestInstruction {
  do(test: Test) {
    test.output();
  }

  *steps() {
    yield this;
  }
}

export interface OutputParams {
  id: string;
  style?: "B" | "D" | "S" | "X";
  len?: number;
  lpad?: number;
  rpad?: number;
  builtin?: boolean;
  address?: number;
}

export class TestOutputListInstruction implements TestInstruction {
  private outputs: OutputParams[] = [];

  constructor(specs: TstOutputSpec[] = []) {
    for (const spec of specs) {
      this.addOutput(spec);
    }
  }

  addOutput(inst: TstOutputSpec) {
    this.outputs.push({
      id: inst.id,
      style: inst.format?.style ?? "B",
      len: inst.format?.width ?? -1,
      lpad: inst.format?.lpad ?? 1,
      rpad: inst.format?.rpad ?? 1,
      builtin: inst.builtin,
      address: inst.address,
    });
  }

  do(test: Test) {
    test.outputList(this.outputs);
    test.header();
  }

  *steps() {
    yield this;
  }
}

export class TestCompoundInstruction implements TestInstruction {
  protected readonly instructions: TestInstruction[] = [];
  span?: Span;

  addInstruction(instruction: TestInstruction) {
    this.instructions.push(instruction);
  }

  do(test: Test<TestInstruction>): void {
    for (const instruction of this.instructions) {
      instruction.do(test);
    }
  }

  *steps(_test: Test): Generator<TestInstruction> {
    yield this;
  }
}

export class TestRepeatInstruction extends TestCompoundInstruction {
  constructor(public readonly repeat: number) {
    super();
  }

  override do() {
    return undefined;
  }

  private *innerSteps(test: Test): Generator<TestInstruction> {
    for (const instruction of this.instructions) {
      yield* instruction.steps(test) as Generator<TestInstruction>;
    }
  }

  override *steps(test: Test): Generator<TestInstruction> {
    if (this.repeat === -1) {
      yield this;
      while (true) {
        yield* this.innerSteps(test);
      }
    } else {
      for (let i = 0; i < this.repeat; i++) {
        yield this;
        yield* this.innerSteps(test);
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
          return `${x}` !== `${y}`;
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
          return x !== y;
      }
    }
    return false;
  }
}

export class TestWhileInstruction extends TestCompoundInstruction {
  constructor(public readonly condition: Condition) {
    super();
  }

  override *steps(test: Test): Generator<TestInstruction> {
    while (this.condition.check(test)) {
      yield this;
      for (const instruction of this.instructions) {
        yield* instruction.steps(test) as Generator<TestInstruction>;
      }
    }
  }
}

export class TestEchoInstruction implements TestInstruction {
  constructor(public readonly content: string) {}
  do(test: Test) {
    test.echo(this.content);
  }

  *steps() {
    yield this;
  }
}

export class TestClearEchoInstruction implements TestInstruction {
  do(test: Test) {
    test.clearEcho();
  }

  *steps() {
    yield this;
  }
}

export class TestLoadROMInstruction implements TestInstruction {
  constructor(readonly file: string) {}
  async do(test: Test) {
    test.fs.pushd("/samples");
    await test.load(this.file);
    test.fs.popd();
  }

  *steps() {
    yield this;
  }
}

export class TestLoadInstruction implements TestInstruction {
  constructor(readonly file?: string) {}

  async do(test: Test) {
    await test.load(this.file);
  }

  *steps() {
    yield this;
  }
}

export class TestBreakpointInstruction implements TestInstruction {
  constructor(readonly variable: string, readonly value: number) {}

  do(test: Test) {
    test.addBreakpoint(this.variable, this.value);
  }

  *steps() {
    yield this;
  }
}

export class TestClearBreakpointsInstruction implements TestInstruction {
  do(test: Test) {
    test.clearBreakpoints();
  }

  *steps() {
    yield this;
  }
}
