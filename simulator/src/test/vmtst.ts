import { RAM } from "../cpu/memory.js";
import { Vm } from "../vm/vm.js";
import { TestInstruction } from "./instruction.js";
import { Test } from "./tst.js";

export class VMTest extends Test<VMTestInstruction> {
  vm: Vm = new Vm();

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
    return false;
  }

  getVar(variable: string | number, index?: number): number {
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
      return this.vm.RAM.get(index);
    }
    return 0;
  }

  setVar(variable: string, value: number, index?: number): void {
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
      this.vm.RAM.set(index, value);
    }
  }

  vmstep(): void {
    this.vm.step();
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
