import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  CPUInput,
  CPUState,
  cpuTick,
  cpuTock,
  emptyState,
} from "../../../cpu/cpu.js";
import {
  KEYBOARD_OFFSET,
  KeyboardAdapter,
  SCREEN_OFFSET,
  SCREEN_SIZE,
} from "../../../cpu/memory.js";
import { load } from "../../../fs.js";
import { int10 } from "../../../util/twos.js";
import {
  Bus,
  Chip,
  ClockedChip,
  ConstantBus,
  FALSE_BUS,
  HIGH,
  LOW,
  Pin,
} from "../../chip.js";
import { RAM, RAM16K } from "../sequential/ram.js";

export class ROM32K extends RAM {
  constructor() {
    super(15, "ROM");
  }

  override async load(fs: FileSystem, path: string) {
    try {
      (await load(fs, path)).map((v, i) => (this.at(i).busVoltage = v));
    } catch (cause) {
      // throw new Error(`ROM32K Failed to load file ${path}`, { cause });
      throw new Error(`ROM32K Failed to load file ${path}`);
    }
  }
}

export class Screen extends RAM {
  static readonly SIZE = SCREEN_SIZE;
  static readonly OFFSET = SCREEN_OFFSET;

  constructor() {
    super(13, "Screen");
  }
}

export class Keyboard extends Chip implements KeyboardAdapter {
  static readonly OFFSET = KEYBOARD_OFFSET;

  constructor() {
    super([], ["out[16]"], "Keyboard");
  }

  getKey() {
    return this.out().busVoltage;
  }

  setKey(key: number) {
    this.out().busVoltage = key & 0xffff;
  }

  clearKey() {
    this.out().busVoltage = 0;
  }

  override get(name: string) {
    return name === this.name
      ? new ConstantBus(this.name, this.getKey()) // readonly
      : super.get(name);
  }
}

export class Memory extends ClockedChip {
  readonly ram = new RAM16K();
  readonly screen = new Screen();
  private keyboard = new Keyboard();
  private address = 0;

  constructor() {
    super(
      ["in[16]", "load", "address[15])"],
      ["out[16]"],
      "Memory",
      [],
      ["in", "load"]
    );
    this.parts.push(this.keyboard);
    this.parts.push(this.screen);
    this.parts.push(this.ram);
  }

  override tick() {
    const load = this.in("load").voltage();
    this.address = this.in("address").busVoltage;
    if (load) {
      const inn = this.in().busVoltage;
      if (this.address > Keyboard.OFFSET) {
        // out of "physical" bounds, should result in some kind of issue...
      }
      if (this.address == Keyboard.OFFSET) {
        // Keyboard, do nothing
      } else if (this.address >= Screen.OFFSET) {
        this.screen.at(this.address - Screen.OFFSET).busVoltage = inn;
      } else {
        this.ram.at(this.address).busVoltage = inn;
      }
    }
  }

  override tock() {
    this.eval();
  }

  override eval() {
    if (!this.ram) return;
    this.address = this.in("address").busVoltage;
    let out = 0;
    if (this.address > Keyboard.OFFSET) {
      // out of "physical" bounds, should result in some kind of issue...
    } else if (this.address == Keyboard.OFFSET) {
      out = this.keyboard?.out().busVoltage ?? 0;
    } else if (this.address >= Screen.OFFSET) {
      out = this.screen?.at(this.address - Screen.OFFSET).busVoltage ?? 0;
    } else {
      out = this.ram?.at(this.address).busVoltage ?? 0;
    }
    this.out().busVoltage = out;
  }

  override in(pin?: string): Pin {
    if (pin?.startsWith("RAM16K")) {
      const idx = int10(pin.match(/\[(?<idx>\d+)]/)?.groups?.idx ?? "0");
      return this.ram.at(idx);
    }
    if (pin?.startsWith("Screen")) {
      const idx = int10(pin.match(/\[(?<idx>\d+)]/)?.groups?.idx ?? "0");
      return this.screen.at(idx);
    }
    if (pin?.startsWith("Keyboard")) {
      return this.keyboard.out();
    }
    return super.in(pin);
  }

  override get(name: string, offset = 0): Pin | undefined {
    if (name.startsWith("RAM16K")) {
      return this.at(offset & 0x3fff);
    }
    if (name.startsWith("Screen")) {
      return this.at(offset & (0x1fff + Screen.OFFSET));
    }
    if (name.startsWith("Keyboard")) {
      return this.at(Keyboard.OFFSET);
    }
    if (name.startsWith("Memory")) {
      return this.at(offset);
    }
    return super.get(name, offset);
  }

  at(offset: number): Pin {
    if (offset > Keyboard.OFFSET) {
      return FALSE_BUS;
    }
    if (offset == Keyboard.OFFSET) {
      return this.keyboard.out();
    }
    if (offset >= Screen.OFFSET) {
      return this.screen.at(offset - Screen.OFFSET);
    }
    return this.ram.at(offset);
  }

  override reset(): void {
    this.address = 0;
    this.ram.reset();
    this.screen.reset();
    super.reset();
  }
}

class DRegisterBus extends Bus {
  constructor(
    name: string,
    private cpu: CPUState,
  ) {
    super(name);
  }

  override get busVoltage(): number {
    return this.cpu.D;
  }

  override set busVoltage(num: number) {
    this.cpu.D = num;
  }
}

class ARegisterBus extends Bus {
  constructor(
    name: string,
    private cpu: CPUState,
  ) {
    super(name);
  }

  override get busVoltage(): number {
    return this.cpu.A;
  }

  override set busVoltage(num: number) {
    this.cpu.A = num;
  }
}

class PCBus extends Bus {
  constructor(
    name: string,
    private cpu: CPUState,
  ) {
    super(name);
  }

  override get busVoltage(): number {
    return this.cpu.PC;
  }

  override set busVoltage(num: number) {
    this.cpu.PC = num;
  }
}

export class CPU extends ClockedChip {
  private _state: CPUState = emptyState();

  get state(): CPUState {
    return this._state;
  }

  constructor() {
    super(
      ["inM[16]", "instruction[16]", "reset"],
      ["outM[16]", "writeM", "addressM[15]", "pc[15]"],
      "CPU",
      [],
      ["pc", "addressM", "reset"],
    );
  }

  override tick(): void {
    const [state, writeM] = cpuTick(this.cpuInput(), this._state);
    this._state = state;
    this.out("writeM").pull(writeM ? HIGH : LOW);
    this.out("outM").busVoltage = this._state.ALU ?? 0;
  }

  override tock(): void {
    if (!this._state) return; // Skip initial tock
    const [output, state] = cpuTock(this.cpuInput(), this._state);
    this._state = state;

    this.out("addressM").busVoltage = output.addressM ?? 0;
    this.out("outM").busVoltage = output.outM ?? 0;
    this.out("writeM").pull(output.writeM ? HIGH : LOW);
    this.out("pc").busVoltage = this._state?.PC ?? 0;
  }

  private cpuInput(): CPUInput {
    const inM = this.in("inM").busVoltage;
    const instruction = this.in("instruction").busVoltage;
    const reset = this.in("reset").busVoltage === 1;
    return { inM, instruction, reset };
  }

  override get(pin: string, offset?: number): Pin | undefined {
    if (pin?.startsWith("ARegister")) {
      return new ARegisterBus("ARegister", this._state);
    }
    if (pin?.startsWith("DRegister")) {
      return new DRegisterBus("DRegister", this._state);
    }
    if (pin?.startsWith("PC")) {
      return new PCBus("PC", this._state);
    }
    return super.get(pin, offset);
  }

  override reset() {
    this._state = emptyState();

    // This is a bit of a hack, but because super.reset() does ticktock,
    // we need to set PC to -1, so that it will be 0 after the reset
    this._state.PC = -1;

    super.reset();
  }
}

export class Computer extends Chip {
  readonly cpu = new CPU();
  readonly ram = new Memory();
  readonly rom = new ROM32K();

  constructor() {
    super(["reset"], []);

    this.wire(this.cpu, [
      { from: { name: "reset", start: 0 }, to: { name: "reset", start: 0 } },
      {
        from: { name: "instruction", start: 0 },
        to: { name: "instruction", start: 0 },
      },
      { from: { name: "oldOutM", start: 0 }, to: { name: "inM", start: 0 } },
      { from: { name: "writeM", start: 0 }, to: { name: "writeM", start: 0 } },
      {
        from: { name: "addressM", start: 0 },
        to: { name: "addressM", start: 0 },
      },
      { from: { name: "newInM", start: 0 }, to: { name: "outM", start: 0 } },
      { from: { name: "pc", start: 0 }, to: { name: "pc", start: 0 } },
    ]);

    this.wire(this.rom, [
      { from: { name: "pc", start: 0 }, to: { name: "address", start: 0 } },
      {
        from: { name: "instruction", start: 0 },
        to: { name: "out", start: 0 },
      },
    ]);

    this.wire(this.ram, [
      { from: { name: "newInM", start: 0 }, to: { name: "in", start: 0 } },
      { from: { name: "writeM", start: 0 }, to: { name: "load", start: 0 } },
      {
        from: { name: "addressM", start: 0 },
        to: { name: "address", start: 0 },
      },
      { from: { name: "oldOutM", start: 0 }, to: { name: "out", start: 0 } },
    ]);

    for (const pin of [...this.ins.entries(), ...this.outs.entries()]) {
      if (this.isClockedPin(pin.name)) {
        this.clockedPins.add(pin.name);
      }
    }
  }

  override eval() {
    super.eval();
  }

  override get(name: string, offset?: number): Pin | undefined {
    if (
      name.startsWith("PC") ||
      name.startsWith("ARegister") ||
      name.startsWith("DRegister")
    ) {
      return this.cpu.get(name);
    }
    if (name.startsWith("RAM16K")) {
      return this.ram.get(name, offset);
    }
    return super.get(name, offset);
  }

  override async load(fs: FileSystem, path: string): Promise<void> {
    return await this.rom.load(fs, path);
  }
}
