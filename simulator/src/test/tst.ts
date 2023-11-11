import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Output } from "../output.js";
import { TestInstruction } from "./instruction.js";

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
