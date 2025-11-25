import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Output } from "../output.js";
import { Action, AsyncAction } from "../types.js";
import {
  OutputParams,
  TestBreakInstruction,
  TestInstruction,
  TestStopInstruction,
} from "./instruction.js";

export const DEFAULT_TIME_WIDTH = 7;

export abstract class Test<IS extends TestInstruction = TestInstruction> {
  protected readonly instructions: (IS | TestInstruction)[] = [];
  protected _outputList: Output[] = [];
  protected _log = "";
  fs: FileSystem = new FileSystem();
  protected doEcho?: Action<string>;
  protected doCompareTo?: AsyncAction<string>;
  protected dir?: string;
  protected outputFileName?: string;

  constructor(
    path?: string,
    doEcho?: Action<string>,
    doCompareTo?: Action<string> | AsyncAction<string>,
  ) {
    this.doEcho = doEcho;
    if (doCompareTo) {
      this.doCompareTo = async (arg) => doCompareTo(arg);
    }
    this.dir = path;
  }

  setFileSystem(fs: FileSystem): this {
    this.fs = fs;
    return this;
  }

  echo(_content: string) {
    this.doEcho?.(_content);
    return;
  }
  clearEcho() {
    this.doEcho?.("");
    return;
  }

  async loadROM(_filename?: string): Promise<void> {
    return undefined;
  }
  async load(_filename?: string): Promise<void> {
    return undefined;
  }

  async compareTo(filename: string): Promise<void> {
    await this.doCompareTo?.(filename);
  }
  outputFile(filename: string): void {
    this.outputFileName = filename;
  }

  private createOutputs(params: OutputParams[]): Output[] {
    return params.map((param) => {
      if (param.len === -1) {
        if (param.id === "time") {
          param.len = DEFAULT_TIME_WIDTH;
          param.style = "S";
        } else {
          const width = this.getWidth(param.id, param.address);
          if (param.style === "B") {
            param.len = width;
          } else if (param.style === "D") {
            param.len = Math.ceil(Math.log(width));
          } else if (param.style === "X") {
            param.len = Math.ceil(width / 4);
          }
        }
      }
      return new Output(
        param.id,
        param.style,
        param.len,
        param.lpad,
        param.rpad,
        param.builtin,
        param.address,
      );
    });
  }

  outputList(params: OutputParams[]): void {
    this._outputList = this.createOutputs(params);
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

  async step() {
    while (!this._step.done) {
      await this._step.value.do(this);
      this._step = this.steps.next();

      if (this._step.value instanceof TestStopInstruction) {
        this._step = this.steps.next();
        return false;
      } else if (this._step.value instanceof TestBreakInstruction) {
        return true;
      }
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
  abstract getWidth(variable: string, offset?: number): number;
}
