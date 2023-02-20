import {
  assertExists,
  checkExhaustive,
} from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Span } from "./languages/base.js";
import {
  Tst,
  TstLineStatement,
  TstOperation,
  TstOutputSpec,
  TstStatement,
  TstWhileStatement,
} from "./languages/tst.js";
import { Bus, Chip, HIGH, Low, LOW } from "./chip/chip.js";
import { Clock } from "./chip/clock.js";
import { Output } from "./output.js";
import { ROM } from "./cpu/memory.js";
import { CPU } from "./cpu/cpu.js";

export abstract class Test<IS extends TestInstruction = TestInstruction> {
  protected readonly instructions: (IS | TestInstruction)[] = [];
  protected _outputList: Output[] = [];
  protected _log = "";
  fs: FileSystem = new FileSystem();

  setFileSystem(fs: FileSystem): this {
    this.fs = fs;
    return this;
  }

  echo(_content: string) {
    return undefined;
  }
  clearEcho() {
    return undefined;
  }

  async load(_filename: string): Promise<void> {
    return undefined;
  }
  async compareTo(_filename: string): Promise<void> {
    return undefined;
  }
  outputFile(_filename: string): void {
    return undefined;
  }
  outputList(outputs: Output[]): void {
    this._outputList = outputs;
  }

  addInstruction(instruction: IS | TestInstruction): void {
    this.instructions.push(instruction);
  }

  reset(): this {
    this._steps = (function* (test) {
      for (const instruction of test.instructions) {
        yield* instruction.steps(test);
      }
    })(this);
    this._step = this._steps.next();
    this._step; //?
    this._log = "";
    return this;
  }

  private _steps!: IterableIterator<IS | TestInstruction>;
  private _step!: IteratorResult<IS | TestInstruction, IS | TestInstruction>;

  get steps(): Iterator<IS | TestInstruction> {
    if (this._steps === undefined) {
      this.reset();
      this._steps = assertExists(this._steps, "Reset did not initialize steps");
      this._step = assertExists(this._step, "Reset did not find first step");
    }
    return this._steps;
  }

  get currentStep(): IS | TestInstruction | undefined {
    return this._step?.value;
  }

  get done(): boolean {
    return this._step?.done ?? false;
  }

  step() {
    if (!this._step.done) {
      this._step.value.do(this);
      this._step = this.steps.next();
      return false;
    }
    return true;
  }

  async run() {
    this.reset();
    while (!(await this.step()));
  }

  protected readonly breakpoints: Map<string, number> = new Map();
  addBreakpoint(variable: string, value: number) {
    this.breakpoints.set(variable, value);
  }
  clearBreakpoints() {
    this.breakpoints.clear();
  }

  output() {
    const values = this._outputList.map((output) => output.print(this));
    this._log += `|${values.join("|")}|\n`;
  }

  header() {
    const values = this._outputList.map((output) => output.header(this));
    this._log += `|${values.join("|")}|\n`;
  }

  log() {
    return this._log;
  }

  abstract hasVar(variable: string | number): boolean;
  abstract getVar(variable: string | number, offset?: number): number | string;
  abstract setVar(variable: string, value: number, offset?: number): void;
}

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
    case "eval":
      return new TestEvalInstruction();
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

function fill<T extends Test>(test: T, tst: Tst): T {
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

export class ChipTest extends Test<ChipTestInstruction> {
  private chip: Chip = new Low();
  get chipId(): number {
    return this.chip.id;
  }

  private clock = Clock.get();

  static from(tst: Tst): ChipTest {
    const test = new ChipTest();
    return fill(test, tst);
  }

  with(chip: Chip): this {
    this.chip = chip;
    return this;
  }

  hasVar(variable: string | number): boolean {
    if (variable === "time") {
      return true;
    }
    variable = `${variable}`;
    // Look up built-in chip state variables
    return this.chip.hasIn(variable) || this.chip.hasOut(variable);
  }

  getVar(variable: string | number, offset?: number): number | string {
    variable = `${variable}`;
    if (variable === "time") {
      return this.clock.toString();
    }
    const pin = this.chip.get(variable, offset);
    if (!pin) return 0;
    return pin instanceof Bus ? pin.busVoltage : pin.voltage();
  }

  setVar(variable: string, value: number, offset?: number): void {
    // Look up built-in chip state variables
    const pinOrBus = this.chip.get(variable, offset);
    if (pinOrBus instanceof Bus) {
      pinOrBus.busVoltage = value;
    } else {
      pinOrBus?.pull(value === 0 ? LOW : HIGH);
    }
  }

  eval(): void {
    this.chip.eval();
  }

  tick(): void {
    this.chip.eval();
    this.clock.tick();
  }

  tock(): void {
    this.chip.eval();
    this.clock.tock();
  }

  override async load(filename: string) {
    await this.chip.load(this.fs, filename);
  }

  override async run() {
    this.clock.reset();
    await super.run();
  }
}

export class CPUTest extends Test<CPUTestInstruction> {
  readonly cpu: CPU;
  private ticks = 0;

  static from(tst: Tst): CPUTest {
    const test = new CPUTest();
    return fill(test, tst);
  }

  constructor(rom: ROM = new ROM(new Int16Array())) {
    super();
    this.cpu = new CPU({ ROM: rom });
  }

  override reset(): this {
    this.cpu.reset();
    this.ticks = 0;
    return this;
  }

  hasVar(variable: string | number): boolean {
    if (typeof variable === "number") {
      return false;
    }
    // A: Current value of the address register (unsigned 15-bit);
    // D: Current value of the data register (16-bit);
    // PC: Current value of the Program Counter (unsigned 15-bit);
    // RAM[i]: Current value of RAM location i (16-bit);
    // time: Number of time units (also called clock cycles, or ticktocks) that elapsed since the simulation started (a read-only system variable).
    if (
      variable === "A" ||
      variable === "D" ||
      variable === "PC" ||
      variable === "time" ||
      variable.startsWith("RAM")
    ) {
      return true;
    }
    return false;
  }

  getVar(variable: string | number): number {
    switch (variable) {
      case "A":
        return this.cpu.A;
      case "D":
        return this.cpu.D;
      case "PC":
        return this.cpu.PC;
      case "time":
        return this.ticks;
    }
    if (typeof variable === "number") return 0;
    if (variable.startsWith("RAM")) {
      const num = Number(variable.substring(4, variable.length - 1));
      return this.cpu.RAM.get(num);
    }
    return 0;
  }

  setVar(variable: string, value: number, index?: number): void {
    // A: Current value of the address register (unsigned 15-bit);
    // D: Current value of the data register (16-bit);
    // PC: Current value of the Program Counter (unsigned 15-bit);
    // RAM[i]: Current value of RAM location i (16-bit);
    switch (variable) {
      case "A":
        this.cpu.setA(value);
        break;
      case "D":
        this.cpu.setD(value);
        break;
      case "PC":
        this.cpu.setPC(value);
        break;
      case "RAM":
        this.cpu.RAM.set(index ?? 0, value);
        break;
    }
    return;
  }

  ticktock(): void {
    this.ticks += 1;
    this.cpu.tick();
  }

  override async load(filename: string): Promise<void> {
    await this.cpu.ROM.load(this.fs, filename);
  }
}

export class VMTest extends Test<VMTestInstruction> {
  hasVar(_variable: string | number): boolean {
    return false;
  }
  getVar(_variable: string | number): number {
    return 0;
  }
  setVar(_variable: string, _value: number): void {
    return undefined;
  }
  vmstep(): void {
    return undefined;
  }
}

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

export class TestOutputListInstruction implements TestInstruction {
  private outputs: Output[] = [];

  constructor(specs: TstOutputSpec[] = []) {
    for (const spec of specs) {
      this.addOutput(spec);
    }
  }

  addOutput(inst: TstOutputSpec) {
    this.outputs.push(
      new Output(
        inst.id,
        inst.style,
        inst.width,
        inst.lpad,
        inst.rpad,
        inst.builtin,
        inst.address
      )
    );
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

  private *innerSteps(test: Test) {
    for (const instruction of this.instructions) {
      yield* instruction.steps(test);
    }
  }

  override *steps(test: Test) {
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

  override *steps(test: Test) {
    while (this.condition.check(test)) {
      yield this;
      for (const instruction of this.instructions) {
        yield* instruction.steps(test);
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

export interface ChipTestInstruction extends TestInstruction {
  _chipTestInstruction_: true;
  do(test: ChipTest): void | Promise<void>;
}

export class TestEvalInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest) {
    test.eval();
  }

  *steps() {
    yield this;
  }
}

export class TestTickInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest) {
    test.tick();
  }

  *steps() {
    yield this;
  }
}

export class TestTockInstruction implements ChipTestInstruction {
  readonly _chipTestInstruction_ = true;
  do(test: ChipTest) {
    test.tock();
  }

  *steps() {
    yield this;
  }
}

export interface CPUTestInstruction extends TestInstruction {
  _cpuTestInstruction_: true;
  do(test: CPUTest): void | Promise<void>;
}

export class TestTickTockInstruction implements CPUTestInstruction {
  readonly _cpuTestInstruction_ = true;
  do(test: CPUTest) {
    test.ticktock();
  }

  *steps() {
    yield this;
  }
}

export interface VMTestInstruction extends TestInstruction {
  _vmTestInstruction_: true;
  do(test: VMTest): void | Promise<void>;
}

export class TestVMStepInstruction implements VMTestInstruction {
  readonly _vmTestInstruction_ = true;
  do(test: VMTest) {
    test.vmstep();
  }

  *steps() {
    yield this;
  }
}
