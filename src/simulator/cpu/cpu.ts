import { alu, Flags } from "./alu";
import { Memory } from "./memory";

export interface CPUInput {
  inM: number;
  instruction: number;
  reset: boolean;
}
export interface CPUOutput {
  outM: number;
  writeM: boolean;
  addressM: number;
}
export interface CPUState {
  A: number;
  D: number;
  PC: number;
}

export function cpu(
  { inM, instruction, reset }: CPUInput,
  { A, D, PC }: CPUState
): [CPUOutput, CPUState] {
  if (reset) {
    return [
      { outM: 0, writeM: false, addressM: 0 },
      { A: 0, D: 0, PC: 0 },
    ];
  }

  let out: CPUOutput = { outM: 0, writeM: false, addressM: 0 };
  let regs: CPUState = { A, D, PC: PC + 1 };

  if ((instruction & 0b1000_0000_0000_0000) === 0) {
    regs.A = instruction;
  } else {
    // Calculate ALU result
    const mode = (instruction & 0b1_0000_0000_0000) === 0;
    const a = mode ? A : inM;
    const op = (instruction & 0b1111_1100_0000) >> 6;
    const [d, flag] = alu(op, D, a);

    // Store M uses old A, this must come first
    if ((instruction & 0b1000) > 0) {
      out.outM = d;
      out.writeM = true;
      out.addressM = A;
    }
    if ((instruction & 0b0000_0000_0010_000) === 0b0000_0000_0010_0000) {
      regs.A = d;
    }
    if ((instruction & 0b0000_0000_0001_0000) === 0b0000_0000_0001_0000) {
      regs.D = d;
    }

    // Check jump
    const jn = (instruction & 0b100) > 0 && flag === Flags.Negative;
    const je = (instruction & 0b010) > 0 && flag === Flags.Zero;
    const jg = (instruction & 0b001) > 0 && flag === Flags.Positive;
    if (jn || je || jg) {
      regs.PC = a;
    }
  }

  return [out, regs];
}

export class CPU {
  RAM: Memory;
  ROM: Memory;

  #pc = 0;
  #a = 0;
  #d = 0;

  get PC() {
    return this.#pc;
  }

  get A() {
    return this.#a;
  }

  get D() {
    return this.#d;
  }

  constructor({
    RAM = new Memory(0x7fff),
    ROM,
  }: {
    RAM?: Memory;
    ROM: Memory;
  }) {
    this.RAM = RAM;
    this.ROM = ROM;
  }

  reset() {
    this.#pc = 0;
    this.#a = 0;
    this.#d = 0;
  }

  tick() {
    const [{ addressM, outM, writeM }, { A, D, PC }] = cpu(
      {
        inM: this.RAM.get(this.#a),
        instruction: this.ROM.get(this.#pc),
        reset: false,
      },
      { A: this.#a, D: this.#d, PC: this.#pc }
    );

    this.#a = A;
    this.#d = D;
    this.#pc = PC;

    if (writeM) {
      this.RAM.set(addressM, outM);
    }
  }
}
