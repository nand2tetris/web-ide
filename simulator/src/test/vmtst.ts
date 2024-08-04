import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Result } from "@davidsouther/jiffies/lib/esm/result.js";
import { RAM } from "../cpu/memory.js";
import { Tst } from "../languages/tst.js";
import { Segment } from "../languages/vm.js";
import { Action, AsyncAction } from "../types.js";
import { Vm } from "../vm/vm.js";
import { fill } from "./builder.js";
import { TestInstruction } from "./instruction.js";
import { Test } from "./tst.js";

export interface VmFile {
  name: string;
  content: string;
}

export class VMTest extends Test<VMTestInstruction> {
  vm: Vm = new Vm();

  private doLoad?: AsyncAction<string>;

  static from(
    tst: Tst,
    options: {
      dir?: string;
      doLoad?: AsyncAction<string>;
      doEcho?: Action<string>;
      compareTo?: Action<string>;
    } = {},
  ): Result<VMTest, Error> {
    const test = new VMTest(options);
    return fill(test, tst);
  }

  constructor({
    dir,
    doEcho,
    doLoad,
    compareTo,
  }: {
    dir?: string;
    doEcho?: Action<string>;
    doLoad?: AsyncAction<string>;
    compareTo?: Action<string>;
  } = {}) {
    super(dir, doEcho, compareTo);
    this.doLoad = doLoad;
  }

  using(fs: FileSystem): this {
    this.fs = fs;
    return this;
  }

  with(vm: Vm) {
    this.vm = vm;
    return this;
  }

  override async load(filename?: string): Promise<void> {
    if (!this.dir) return;
    const dir = assertExists(this.dir?.split("/").slice(0, -1).join("/"));
    const vm = await this.doLoad?.(filename ? `${dir}/${filename}` : dir);
    if (vm) {
      this.vm = vm;
    }
  }

  hasVar(variable: string | number, index?: number): boolean {
    if (typeof variable !== "string") {
      index = variable;
      variable = "RAM";
    }
    if (
      variable === "RAM" &&
      index !== undefined &&
      index > 0 &&
      index < RAM.SIZE
    ) {
      return true;
    }
    return [
      "argument",
      "local",
      "static",
      "constant",
      "this",
      "that",
      "pointer",
      "temp",
    ].includes(variable.toLowerCase());
  }

  getVar(variable: string | number, index?: number): number {
    if (typeof variable !== "string") {
      index = variable;
      variable = "RAM";
    }
    if (variable === "RAM" && index !== undefined) {
      return this.vm.RAM.get(index);
    }
    return this.vm.memory.getSegment(variable as Segment, index ?? 0);
  }

  getWidth(variable: string, offset?: number): number {
    return 16;
  }

  setVar(variable: string, value: number, index?: number): void {
    if (typeof variable !== "string") {
      index = variable;
      variable = "RAM";
    }
    if (variable === "RAM" && index !== undefined) {
      this.vm.RAM.set(index, value);
      return;
    }
    if (index !== undefined) {
      this.vm.memory.setSegment(variable as Segment, index, value);
    } else {
      switch (variable.toLowerCase()) {
        case "sp":
          this.vm.memory.SP = value;
          break;
        case "arg":
        case "argument":
          this.vm.memory.ARG = value;
          this.vm.segmentInitializations["argument"].initialized = true;
          break;
        case "lcl":
        case "local":
          this.vm.memory.LCL = value;
          this.vm.segmentInitializations["local"].initialized = true;
          break;
        case "this":
          this.vm.memory.THIS = value;
          this.vm.invocation.thisInitialized = true;
          break;
        case "that":
          this.vm.memory.THAT = value;
          this.vm.invocation.thatInitialized = true;
          break;
      }
    }
  }

  vmstep(): void {
    this.vm.step();
  }
}

export interface VMTestInstruction extends TestInstruction {
  _vmTestInstruction_: true;
  do(test: VMTest): Promise<void>;
}

export class TestVMStepInstruction implements VMTestInstruction {
  readonly _vmTestInstruction_ = true;
  async do(test: VMTest) {
    test.vmstep();
  }

  *steps() {
    yield this;
  }
}
