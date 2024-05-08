import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { RAM } from "../cpu/memory.js";
import { Tst } from "../languages/tst.js";
import { Segment } from "../languages/vm.js";
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

  private loadAction?: (files: VmFile[]) => void;
  private dir?: string;

  static from(
    tst: Tst,
    path?: string,
    loadAction?: (files: VmFile[]) => void,
    doEcho?: (status: string) => void
  ): VMTest {
    const test = new VMTest(doEcho);
    test.dir = path?.split("/").slice(0, -1).join("/");
    test.loadAction = loadAction;
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

  // override async load(filename?: string) {
  //   if (!this.loadAction) {
  //     return;
  //   }
  //   if (filename) {
  //     const file = await this.fs.readFile(
  //       `${this.dir ? `${this.dir}/` : ""}${filename}`
  //     );
  //     this.loadAction?.([{ name: filename.replace(".vm", ""), content: file }]);
  //   } else {
  //     const stats = await this.fs.scandir(this.dir ?? "/");
  //     const files: VmFile[] = [];
  //     for (const stat of stats) {
  //       if (stat.isFile() && stat.name.endsWith(".vm")) {
  //         const file = await this.fs.readFile(
  //           `${this.dir ? `${this.dir}/` : ""}${stat.name}`
  //         );
  //         files.push({ name: stat.name.replace(".vm", ""), content: file });
  //       }
  //     }
  //     this.loadAction(files);
  //   }
  // }
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
