import { alu, COMMANDS_OP, Flags } from "./alu.js";
import { Memory, SubMemory } from "./memory.js";

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

export function emptyState(): CPUState {
  return { A: 0, D: 0, PC: 0, ALU: 0, flag: Flags.Zero };
}

const BITS = {
  c: 0b1000_0000_0000_0000,
  x1: 0b1001_0000_0000_0000,
  x2: 0b1001_0000_0000_0000,
  am: 0b1001_0000_0000_0000,
  op: 0b0000_1111_1100_0000,
  d1: 0b1000_0000_0010_0000,
  d2: 0b1000_0000_0001_0000,
  d3: 0b1000_0000_0000_1000,
  j1: 0b1000_0000_0000_0001,
  j2: 0b1000_0000_0000_0010,
  j3: 0b1000_0000_0000_0100,
};

export function decode(instruction: number) {
  function bit(bit: number): boolean {
    return (instruction & bit) === bit;
  }
  const bits = {
    c: bit(BITS.c),
    x1: bit(BITS.x1),
    x2: bit(BITS.x2),
    am: bit(BITS.am),
    op: ((instruction & BITS.op) >> 6) as COMMANDS_OP,
    d1: bit(BITS.d1),
    d2: bit(BITS.d2),
    d3: bit(BITS.d3),
    j1: bit(BITS.j1),
    j2: bit(BITS.j2),
    j3: bit(BITS.j3),
  };

  return bits;
}

export function cpuTick(
  { inM, instruction }: CPUInput,
  { A, D, PC }: CPUState
): [CPUState, boolean] {
  const bits = decode(instruction);
  const a = bits.am ? inM : A;
  const [ALU, flag] = alu(bits.op, D, a);

  return [{ A, D, PC: PC + 1, ALU, flag }, bits.d3];
}

export function cpuTock(
  { inM, instruction, reset }: CPUInput,
  { A, D, PC, ALU, flag }: CPUState
): [CPUOutput, CPUState] {
  const bits = decode(instruction);

  const j1 = bits.j1 && flag === Flags.Positive;
  const j2 = bits.j2 && flag === Flags.Zero;
  const j3 = bits.j3 && flag === Flags.Negative;
  const jmp = j1 || j2 || j3;

  PC = reset ? 0 : jmp ? A : PC;

  if (bits.d2) {
    D = ALU;
  }

  if (!bits.c) {
    A = instruction & 0x7fff;
  } else if (bits.d1) {
    A = ALU;
  }

  const a = bits.am ? inM : A;
  const alu2 = alu(bits.op, D, a);

  ALU = alu2[0];
  flag = alu2[1];

  const output: CPUOutput = {
    addressM: A,
    outM: ALU,
    writeM: bits.d3,
  };

  const state: CPUState = {
    A,
    D,
    ALU,
    flag,
    PC,
  };

  return [output, state];
}

export function cpu(input: CPUInput, state: CPUState): [CPUOutput, CPUState] {
  const [tickState, _writeM] = cpuTick(input, state);
  return cpuTock(input, tickState);
}

export class CPU {
  readonly RAM: Memory;
  readonly ROM: Memory;
  readonly Screen: Omit<Memory, "memory">;
  readonly Keyboard: Omit<Memory, "memory">;

  #pc = 0;
  #a = 0;
  #d = 0;

  #tickState: CPUState = {
    A: 0,
    D: 0,
    PC: 0,
    ALU: 0,
    flag: Flags.Zero,
  };

  get state(): CPUState {
    return this.#tickState;
  }

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
    RAM = new Memory(0x8000),
    ROM,
  }: {
    RAM?: Memory;
    ROM: Memory;
  }) {
    this.RAM = RAM;
    this.ROM = ROM;

    this.Screen = new SubMemory(this.RAM, 0x2000, 0x4000);
    this.Keyboard = new SubMemory(this.RAM, 1, 0x6000);
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
