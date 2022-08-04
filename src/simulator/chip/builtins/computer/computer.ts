import { Chip, ClockedChip, ConstantBus, HIGH, LOW, Pin } from "../../chip";
import { RAM, RAM16K } from "../sequential/ram";
import {
  cpu,
  CPUInput,
  CPUOutput,
  CPUState,
  cpuTick,
  cpuTock,
} from "../../../cpu/cpu";
import { int10 } from "../../../../util/twos";

export class ROM32K extends RAM {
  constructor() {
    super(16);
  }
}

export class Screen extends RAM {
  static readonly OFFSET = 0x4000;

  constructor() {
    super(13);
  }
}

export class Keyboard extends Chip {
  static readonly OFFSET = 0x6000;

  constructor() {
    super([], ["out[16]"]);
  }

  setKey(key: number) {
    this.out().busVoltage = key & 0xffff;
  }

  clearKey() {
    this.out().busVoltage = 0;
  }
}

export class Memory extends ClockedChip {
  private ram = new RAM16K();
  private screen = new Screen();
  private keyboard = new Keyboard();
  private address = 0;

  constructor() {
    super(["in[16]", "load", "address[16])"], ["out[16]"], "Memory");
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
  private state: CPUState = {
    A: 0,
    D: 0,
    PC: 0,
    ALU: 0,
    flag: 0,
    writeM: false,
  };
  private output: CPUOutput = { addressM: 0, outM: 0, writeM: false, pc: 0 };

  constructor() {
    super(
      ["inM[16]", "instruction[16]", "reset"],
      ["outM[16]", "writeM", "addressM[15]", "pc[15]"]
    );
  }

  override tick(): void {
    this.state = cpuTick(this.cpuInput(), this.state);

    this.out("writeM").pull(this.state.writeM ? HIGH : LOW);
  }

  override tock(): void {
    const [output, state] = cpuTock(this.cpuInput(), this.state);
    this.output = output;
    this.state = state;

    this.out("outM").busVoltage = this.output?.outM ?? 0;
    this.out("writeM").pull(this.output?.writeM ? HIGH : LOW);
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
      { from: { name: "inM", start: 0 }, to: { name: "outM", start: 0 } },
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
}
