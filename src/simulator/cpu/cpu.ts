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
  pc: number;
}

export interface CPUState {
  A: number;
  D: number;
  PC: number;
  ALU: number;
  flag: number;
  writeM: boolean;
}

function decode(instruction: number) {
  const bits = {
    c: (instruction & 0b1000_0000_0000_0000) === 0b1000_0000_0000_0000,
    x1: (instruction & 0b1100_0000_0000_0000) === 0b1001_0000_0000_0000,
    x2: (instruction & 0b1010_0000_0000_0000) === 0b1001_0000_0000_0000,
    am: (instruction & 0b1001_0000_0000_0000) === 0b1001_0000_0000_0000,
    op: (instruction & 0b000_1111_1100_0000) >> 6,
    d1: (instruction & 0b1000_0000_0010_0000) === 0b1000_0000_0010_0000,
    d2: (instruction & 0b1000_0000_0001_0000) === 0b1000_0000_0001_0000,
    d3: (instruction & 0b1000_0000_0000_1000) === 0b1000_0000_0001_0000,
    j1: (instruction & 0b1000_0000_0000_0001) === 0b1000_0000_0000_0001,
    j2: (instruction & 0b1000_0000_0000_0001) === 0b1000_0000_0000_0010,
    j3: (instruction & 0b1000_0000_0000_0001) === 0b1000_0000_0000_0100,
  };

  return bits;
}

export function cpuTick(
  { inM, instruction }: CPUInput,
  { A, D, PC }: CPUState
): CPUState {
  const bits = decode(instruction);
  const a = bits.am ? inM : A;
  const [ALU, flag] = alu(bits.op, D, a);
  const writeM = bits.d3;

  return { A, D, PC, ALU, flag, writeM };
}

export function cpuTock(
  { instruction, reset }: CPUInput,
  { A, D, PC, ALU, flag, writeM }: CPUState
): [CPUOutput, CPUState] {
  const bits = decode(instruction);

  const j1 = bits.j1 && flag === Flags.Positive;
  const j2 = bits.j2 && flag === Flags.Zero;
  const j3 = bits.j3 && flag === Flags.Negative;
  const jmp = j1 || j2 || j3;

  PC = reset ? 0 : jmp ? A : PC + 1;

  if (bits.d2) {
    D = ALU;
  }

  if (!bits.c) {
    A = instruction & 0x7fff;
  } else if (bits.d1) {
    A = ALU;
  }

  const output: CPUOutput = {
    addressM: A,
    outM: ALU,
    writeM,
    pc: PC,
  };

  const state: CPUState = {
    A,
    D,
    ALU,
    flag,
    PC,
    writeM,
  };

  return [output, state];
}

export function cpuTickTock(
  input: CPUInput,
  state: CPUState
): [CPUOutput, CPUState] {
  const tickState = cpuTick(input, state);
  return cpuTock(input, tickState);
}

export function cpu(inn: CPUInput, state: CPUState): [CPUOutput, CPUState] {
  state = cpuTick(inn, state);
  return cpuTock(inn, state);
}

export class CPU {
  RAM: Memory;
  ROM: Memory;

  #pc = 0;
  #a = 0;
  #d = 0;

  #tickState: CPUState = {
    A: 0,
    D: 0,
    PC: 0,
    ALU: 0,
    flag: Flags.Zero,
    writeM: false,
  };

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
      {
        A: this.#a,
        D: this.#d,
        PC: this.#pc,
        ALU: this.#d,
        flag: Flags.Zero,
        writeM: false,
      }
    );

    this.#a = A;
    this.#d = D;
    this.#pc = PC;

    if (writeM) {
      this.RAM.set(addressM, outM);
    }
  }
}
