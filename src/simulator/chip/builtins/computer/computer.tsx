import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { Screen as ScreenComponent } from "../../../../app/components/chips/screen";
import { Keyboard as KeyboardComponent } from "../../../../app/components/chips/keyboard";
import { Chip, ClockedChip, ConstantBus, HIGH, LOW, Pin } from "../../chip";
import { RAM, RAM16K } from "../sequential/ram";
import {
  CPUInput,
  CPUState,
  cpuTick,
  cpuTock,
  decode,
  emptyState,
} from "../../../cpu/cpu";
import { int10 } from "../../../../util/twos";
import { loadHack } from "../../../fs";
import { Flags } from "../../../cpu/alu";
import { RegisterComponent } from "../../../../app/components/chips/register";
import { ALUComponent } from "../../../../app/components/chips/alu";
import { KEYBOARD, SCREEN } from "../../../cpu/memory";

export class ROM32K extends RAM {
  constructor() {
    super(16, "ROM");
  }

  override async load(fs: FileSystem, path: string) {
    try {
      (await loadHack(fs, path)).map((v, i) => (this.at(i).busVoltage = v));
    } catch (cause) {
      // throw new Error(`ROM32K Failed to load file ${path}`, { cause });
      throw new Error(`ROM32K Failed to load file ${path}`);
    }
  }
}

export class Screen extends RAM {
  static readonly OFFSET = SCREEN;

  constructor() {
    super(13, "Screen");
  }

  override render() {
    return [<ScreenComponent memory={this.memory} />];
  }
}

export class Keyboard extends Chip {
  static readonly OFFSET = KEYBOARD;

  constructor() {
    super([], ["out[16]"], "Keyboard");
  }

  setKey(key: number) {
    this.out().busVoltage = key & 0xffff;
  }

  clearKey() {
    this.out().busVoltage = 0;
  }

  override render() {
    return [<KeyboardComponent keyboard={this} />];
  }
}

export class Memory extends ClockedChip {
  private ram = new RAM16K();
  private screen = new Screen();
  private keyboard = new Keyboard();
  private address = 0;

  constructor() {
    super(["in[16]", "load", "address[15])"], ["out[16]"], "Memory");
    this.parts.add(this.keyboard);
    this.parts.add(this.screen);
    this.parts.add(this.ram);
  }

  override tick() {
    const load = this.in("load").voltage();
    this.address = this.in("address").busVoltage;
    if (load) {
      const inn = this.in().busVoltage;
      if (this.address >= Keyboard.OFFSET) {
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
    if (this.address >= Keyboard.OFFSET) {
      // Keyboard, do nothing
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
    if (offset >= Keyboard.OFFSET) {
      return this.keyboard.out();
    }
    if (offset >= Screen.OFFSET) {
      return this.screen.at(offset - Screen.OFFSET);
    } else {
      return this.ram.at(offset);
    }
  }
}

export class CPU extends ClockedChip {
  private state: CPUState = emptyState();

  constructor() {
    super(
      ["inM[16]", "instruction[16]", "reset"],
      ["outM[16]", "writeM", "addressM[15]", "pc[15]"]
    );
  }

  override tick(): void {
    const [state, writeM] = cpuTick(this.cpuInput(), this.state);
    this.state = state;
    this.out("writeM").pull(writeM ? HIGH : LOW);
    this.out("outM").busVoltage = this.state.ALU ?? 0;
  }

  override tock(): void {
    if (!this.state) return; // Skip initial tock
    const [output, state] = cpuTock(this.cpuInput(), this.state);
    this.state = state;

    this.out("addressM").busVoltage = output.addressM ?? 0;
    this.out("outM").busVoltage = output.outM ?? 0;
    this.out("writeM").pull(output.writeM ? HIGH : LOW);
    this.out("pc").busVoltage = this.state?.PC ?? 0;
  }

  private cpuInput(): CPUInput {
    const inM = this.in("inM").busVoltage;
    const instruction = this.in("instruction").busVoltage;
    const reset = this.in("reset").busVoltage === 1;
    return { inM, instruction, reset };
  }

  override get(pin: string, offset?: number): Pin | undefined {
    if (pin?.startsWith("ARegister")) {
      return new ConstantBus("ARegister", this.state.A);
    }
    if (pin?.startsWith("DRegister")) {
      return new ConstantBus("DRegister", this.state.D);
    }
    if (pin?.startsWith("PC")) {
      return new ConstantBus("PC", this.state.PC);
    }
    return super.get(pin, offset);
  }

  override render() {
    const bits = decode(this.in("instruction").busVoltage);
    return [
      <RegisterComponent name={"A"} bits={this.state.A} />,
      <RegisterComponent name={"D"} bits={this.state.D} />,
      <RegisterComponent name={"PC"} bits={this.state.PC} />,
      <ALUComponent
        A={bits.am ? this.in("inM").busVoltage : this.state.A}
        D={this.state.D}
        out={this.state.ALU}
        op={bits.op}
        flag={this.state.flag as keyof typeof Flags}
      />,
    ];
  }
}

export class Computer extends Chip {
  #ram = new Memory();
  #rom = new ROM32K();
  #cpu = new CPU();

  constructor() {
    super(["reset"], []);

    this.wire(this.#cpu, [
      { from: { name: "reset", start: 0 }, to: { name: "reset", start: 0 } },
      {
        from: { name: "instruction", start: 0 },
        to: { name: "instruction", start: 0 },
      },
      { from: { name: "outM", start: 0 }, to: { name: "inM", start: 0 } },
      { from: { name: "writeM", start: 0 }, to: { name: "writeM", start: 0 } },
      {
        from: { name: "addressM", start: 0 },
        to: { name: "addressM", start: 0 },
      },
    ]);

    this.wire(this.#rom, [
      { from: { name: "pc", start: 0 }, to: { name: "address", start: 0 } },
      {
        from: { name: "instruction", start: 0 },
        to: { name: "out", start: 0 },
      },
    ]);

    this.wire(this.#ram, [
      { from: { name: "inM", start: 0 }, to: { name: "in", start: 0 } },
      { from: { name: "writeM", start: 0 }, to: { name: "load", start: 0 } },
      {
        from: { name: "addressM", start: 0 },
        to: { name: "address", start: 0 },
      },
      { from: { name: "outM", start: 0 }, to: { name: "out", start: 0 } },
    ]);
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
      return this.#cpu.get(name);
    }
    if (name.startsWith("RAM16K")) {
      return this.#ram.get(name, offset);
    }
    return super.get(name, offset);
  }

  override load(fs: FileSystem, path: string): Promise<void> {
    return this.#rom.load(fs, path);
  }
}
