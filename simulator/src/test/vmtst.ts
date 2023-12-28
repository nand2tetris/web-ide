import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { RAM } from "../cpu/memory.js";
import { Tst } from "../languages/tst.js";
import { VM } from "../languages/vm.js";
import { Segment, Vm } from "../vm/vm.js";
import { fill } from "./builder.js";
import { TestInstruction } from "./instruction.js";
import { Test } from "./tst.js";

export class VMTest extends Test<VMTestInstruction> {
  vm: Vm = new Vm();

  static from(tst: Tst): VMTest {
    const test = new VMTest();
    return fill(test, tst);
  }

  using(fs: FileSystem): this {
    this.fs = fs;
    return this;
  }

  with(vm: Vm) {
    this.vm = vm;
    return this;
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

  setVar(variable: string, value: number, index?: number): void {
    if (typeof variable !== "string") {
      index = variable;
      variable = "RAM";
    }
    if (variable === "RAM" && index !== undefined) {
      this.vm.RAM.set(index, value);
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
          break;
        case "lcl":
        case "local":
          this.vm.memory.LCL = value;
          break;
        case "this":
          this.vm.memory.THIS = value;
          break;
        case "that":
          this.vm.memory.THAT = value;
          break;
      }
    }
  }

  vmstep(): void {
    this.vm.step();
  }

  override async load(filename?: string) {
    if (filename) {
      const file = await this.fs.readFile(filename);
      const { instructions } = unwrap(VM.parse(file));
      unwrap(this.vm.load(instructions, true));
    } else {
      for (const file of await this.fs.scandir(".")) {
        if (file.isFile() && file.name.endsWith(".vm")) {
          await this.load(file.name);
        }
      }
    }
    unwrap(this.vm.bootstrap());
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
