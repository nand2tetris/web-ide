import { Chip, HIGH, LOW, Pin } from "../../chip";
import { RAM, RAM16K } from "../sequential/ram";
import { cpu } from "../../../cpu/cpu";
import { int10 } from "../../../../util/twos";

export class ROM32K extends RAM {
  constructor() {
    super(16);
  }
}

export class Screen extends RAM {
  constructor() {
    super(13);
  }
}

export class Keyboard extends Chip {
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

export class Memory extends Chip {
  private ram = new RAM16K();
  private screen = new Screen();
  private keyboard = new Keyboard();
  private nextWrite: number = 0;

  constructor() {
    super(["in[16]", "load", "address[16])"], ["out[16]"], "Memory");
  }

  override tick() {}

  override tock() {
    // const load = this.in("load").voltage();
    // const address = this.in("address").busVoltage;
    // if (load === HIGH) {
    //   this.ram.
    // }
  }

  override in(pin?: string): Pin {
    if (pin?.startsWith("RAM16K")) {
      const idx = int10(pin.match(/\[(?<idx>\d+)]/)?.groups?.idx ?? "0");
      return this.ram.at(idx);
    }
    return super.in(pin);
  }
}

export class CPU extends Chip {
  private A = 0;
  private D = 0;
  private PC = 0;

  constructor() {
    super(
      ["inM[16]", "instruction[16]", "reset"],
      ["outM[16]", "writeM", "addressM[15]", "pc[15]"]
    );
  }

  override eval(): void {
    const inM = this.in("inM").busVoltage;
    const instruction = this.in("instruction").busVoltage;
    const reset = this.in("reset").busVoltage === 1;

    const [{ addressM, outM, writeM }, { A, D, PC }] = cpu(
      { inM, instruction, reset },
      { A: this.A, D: this.D, PC: this.PC }
    );

    this.A = A;
    this.D = D;
    this.PC = PC;

    this.out("addressM").busVoltage = addressM;
    this.out("outM").busVoltage = outM;
    this.out("writeM").pull(writeM ? HIGH : LOW);
  }
}

export class Computer extends Chip {
  constructor() {
    super(["reset"], []);
  }
}
