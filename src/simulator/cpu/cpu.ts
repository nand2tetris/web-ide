import { alu, Flags } from "./alu";
import { Memory } from "./memory";
export function cpu(
  {
    inM,
    instruction,
    reset,
  }: { inM: number; instruction: number; reset: boolean },
  { A, D, PC }: { A: number; D: number; PC: number }
): [
  { outM: number; writeM: boolean; addressM: number; pc: number },
  { A: number; D: number }
] {
  if (reset) {
    return [
      { outM: 0, writeM: false, addressM: 0, pc: 0 },
      { A: 0, D: 0 },
    ];
  }

  // Calculate ALU result
  const mode = (instruction & 0x1000) > 0;
  const op = (instruction & 0x0fc0) >> 6;
  const a = mode ? inM : A;
  const [d, flag] = alu(op, D, a);

  let out = { outM: 0, writeM: false, addressM: 0, pc: PC + 1 };
  let regs = { A, D };

  // Store M uses old A, this must come first
  if ((instruction & 0x0008) > 0) {
    out.outM = a;
    out.writeM = true;
  }
  if ((instruction & 0x0020) > 0) {
    regs.A = d;
  }
  if ((instruction & 0x0010) > 0) {
    regs.D = d;
  }

  // Check jump
  const jn = (instruction & 0x0004) > 0 && flag === Flags.Negative;
  const je = (instruction & 0x0002) > 0 && flag === Flags.Zero;
  const jg = (instruction & 0x0001) > 0 && flag === Flags.Positive;
  if (jn || je || jg) {
    out.pc = a;
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
    const [{ addressM, outM, writeM, pc }, { A, D }] = cpu(
      {
        inM: this.RAM.get(this.#a),
        instruction: this.ROM.get(this.#pc),
        reset: false,
      },
      { A: this.#a, D: this.#d, PC: this.#pc }
    );

    this.#a = A;
    this.#d = D;
    this.#pc = pc;

    if (writeM) {
      this.RAM.set(addressM, outM);
    }
  }
}
