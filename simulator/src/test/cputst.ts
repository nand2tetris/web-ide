import { CPU } from "../cpu/cpu.js";
import { ROM } from "../cpu/memory.js";
import { Tst } from "../languages/tst.js";
import { fill } from "./builder.js";
import { TestInstruction } from "./instruction.js";
import { Test } from "./tst.js";

export class CPUTest extends Test<CPUTestInstruction> {
  readonly cpu: CPU;
  private ticks = 0;

  static from(tst: Tst, rom?: ROM, doEcho?: (status: string) => void): CPUTest {
    const test = new CPUTest(rom, doEcho);
    return fill(test, tst);
  }

  constructor(rom: ROM = new ROM(), doEcho?: (status: string) => void) {
    super(doEcho);
    this.cpu = new CPU({ ROM: rom });
    this.reset();
  }

  override reset(): this {
    super.reset();
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

  getVar(variable: string | number, offset?: number): number {
    switch (variable) {
      case "A":
        return this.cpu.A;
      case "D":
        return this.cpu.D;
      case "PC":
        return this.cpu.PC;
      case "time":
        return this.ticks;
      case "RAM":
        // Exact RAM with offset
        return offset === undefined ? 0 : this.cpu.RAM.get(offset);
    }
    if (typeof variable === "number") return 0;
    if (variable.startsWith("RAM")) {
      // RAM with implicit offset, EG: RAM[123]
      const num = Number(variable.substring(4, variable.length - 1));
      return this.cpu.RAM.get(num);
    }
    return 0;
  }

  getWidth(variable: string, offset?: number): number {
    return 16;
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

  override async loadROM(filename: string): Promise<void> {
    await this.cpu.ROM.load(this.fs, filename);
  }
}

export interface CPUTestInstruction extends TestInstruction {
  _cpuTestInstruction_: true;
  do(test: CPUTest): Promise<void>;
}

export class TestTickTockInstruction implements CPUTestInstruction {
  readonly _cpuTestInstruction_ = true;
  async do(test: CPUTest) {
    test.ticktock();
  }

  *steps() {
    yield this;
  }
}
