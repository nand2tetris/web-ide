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
  ALU: number;
  flag: number;
}

export function cpuTick(
  { inM, instruction, reset }: CPUInput,
  { A, D, PC, ALU, flag }: CPUState
): CPUState {
  let regs: CPUState = { A, D, PC: reset ? 0 : PC + 1, ALU, flag };

  if ((instruction & 0b1000_0000_0000_0000) === 0) {
    regs.A = instruction;
  }
  if ((instruction & 0b1000_0000_0010_000) === 0b1000_0000_0010_0000) {
    regs.A = ALU;
  }
  if ((instruction & 0b1000_0000_0001_0000) === 0b1000_0000_0001_0000) {
    regs.D = ALU;
  }

  // Check jump
  const jn = (instruction & 0b100) > 0 && flag === Flags.Negative;
  const je = (instruction & 0b010) > 0 && flag === Flags.Zero;
  const jg = (instruction & 0b001) > 0 && flag === Flags.Positive;
  if (!reset && (jn || je || jg)) {
    regs.PC = regs.A;
  }

  return regs;
}

export function cpuTock(
  { inM, instruction }: CPUInput,
  { A, D, PC }: CPUState
): [CPUOutput, CPUState] {
  const mode = (instruction & 0b1_0000_0000_0000) === 0;
  const a = mode ? A : inM;
  const op = (instruction & 0b1111_1100_0000) >> 6;
  const [ALU, flag] = alu(op, D, a);

  const regs: CPUState = { A, D, PC, ALU, flag };
  const output = {
    outM: ALU,
    writeM: (instruction & 0b1000) === 0b1000,
    addressM: A,
  };

  return [output, regs];
}

export function cpuTickTock(
  input: CPUInput,
  state: CPUState
): [CPUOutput, CPUState] {
  const tickState = cpuTick(input, state);
  return cpuTock(input, tickState);
}

export function cpu(
  { inM, instruction, reset }: CPUInput,
  { A, D, PC, ALU, flag }: CPUState
): [CPUOutput, CPUState] {
  if (reset) {
    return [
      { outM: 0, writeM: false, addressM: 0 },
      { A: 0, D: 0, PC: 0, ALU: 0, flag: Flags.Zero },
    ];
  }

  let out: CPUOutput = { outM: ALU, writeM: false, addressM: A };
  let regs: CPUState = { A, D, PC: PC + 1, ALU, flag };

  if ((instruction & 0b1000_0000_0000_0000) === 0) {
    out.addressM = regs.A = instruction;
  } else {
    // Calculate ALU result
    const mode = (instruction & 0b1_0000_0000_0000) === 0;
    const a = mode ? A : inM;
    const op = (instruction & 0b1111_1100_0000) >> 6;
    const [d, flag] = alu(op, D, a);
    regs.ALU = d;
    regs.flag = flag;
    out.outM = d;
    out.addressM = A;

    // Store M uses old A, this must come first
    if ((instruction & 0b1000) > 0) {
      out.writeM = true;
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
      regs.PC = regs.A;
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

  #tickState: CPUState = { A: 0, D: 0, PC: 0, ALU: 0, flag: Flags.Zero };

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
      { A: this.#a, D: this.#d, PC: this.#pc, ALU: this.#d, flag: Flags.Zero }
    );

    this.#a = A;
    this.#d = D;
    this.#pc = PC;

    if (writeM) {
      this.RAM.set(addressM, outM);
    }
  }
}
