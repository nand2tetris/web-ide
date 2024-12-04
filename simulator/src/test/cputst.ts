import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { Result } from "@davidsouther/jiffies/lib/esm/result.js";
import { CPU } from "../cpu/cpu.js";
import { ROM } from "../cpu/memory.js";
import { Tst } from "../languages/tst.js";
import { Action, AsyncAction } from "../types.js";
import { fill, isTstCommand } from "./builder.js";
import { TestInstruction } from "./instruction.js";
import { Test } from "./tst.js";

export class CPUTest extends Test<CPUTestInstruction> {
  cpu: CPU;
  private ticks = 0;
  private doLoad?: AsyncAction<string>;
  fileLoaded = false;
  hasLoad = false;

  static from(
    tst: Tst,
    options: {
      dir?: string;
      rom?: ROM;
      doEcho?: Action<string>;
      doLoad?: AsyncAction<string>;
      compareTo?: Action<string>;
      requireLoad?: boolean;
    } = {},
  ): Result<CPUTest, Error> {
    const test = new CPUTest(options);

    test.hasLoad = tst.lines.some(
      (line) => isTstCommand(line) && line.op.op == "load",
    );

    return fill(test, tst, options.requireLoad);
  }

  constructor({
    dir,
    rom = new ROM(),
    doEcho,
    doLoad,
    compareTo,
  }: {
    dir?: string;
    rom?: ROM;
    doEcho?: Action<string>;
    doLoad?: AsyncAction<string>;
    compareTo?: Action<string>;
  } = {}) {
    super(dir, doEcho, compareTo);
    this.doLoad = doLoad;
    this.cpu = new CPU({ ROM: rom });
    this.reset();
  }

  override async step() {
    if (!this.hasLoad && this.cpu.ROM.isEmpty()) {
      throw new Error(
        "Cannot execute the test without first loading an .asm or .hack file",
      );
    }
    return super.step();
  }

  override async load(filename?: string): Promise<void> {
    if (!filename && !this.dir) return;
    const dir = assertExists(this.dir?.split("/").slice(0, -1).join("/"));
    const rom = await this.doLoad?.(filename ? `${dir}/${filename}` : dir);
    if (rom) {
      this.cpu = new CPU({ ROM: rom });
    }
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

export class TestResetRamInstruction implements CPUTestInstruction {
  readonly _cpuTestInstruction_ = true;
  async do(test: CPUTest) {
    test.cpu.RAM.reset();
  }

  *steps() {
    yield this;
  }
}
