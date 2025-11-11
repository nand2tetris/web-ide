const commandASMValues = new Set([
  "0",
  "1",
  "-1",
  "D",
  "A",
  "!D",
  "!A",
  "-D",
  "-A",
  "D+1",
  "A+1",
  "D-1",
  "A-1",
  "D+A",
  "D-A",
  "A-D",
  "D&A",
  "D|A",
] as const);

export type COMMANDS_ASM = typeof commandASMValues extends Set<infer S>
  ? S
  : never;

export function isCommandAsm(command: string): command is COMMANDS_ASM {
  return (
    commandASMValues.has(command as COMMANDS_ASM) ||
    commandASMValues.has(command.replace("M", "A") as COMMANDS_ASM)
  );
}

export type COMMANDS_OP =
  | 0b101010
  | 0b111111
  | 0b111010
  | 0b001100
  | 0b110000
  | 0b110000
  | 0b001101
  | 0b110001
  | 0b001111
  | 0b110011
  | 0b011111
  | 0b110111
  | 0b001110
  | 0b110010
  | 0b000010
  | 0b010011
  | 0b010011
  | 0b000111
  | 0b000000
  | 0b000000
  | 0b010101
  | 0b010101;

//Usefull for the visualization of the ALU
export type COMMANDS_ALU =
  | "0"
  | "1"
  | "-1"
  | "x"
  | "y"
  | "!x"
  | "!y"
  | "-x"
  | "-y"
  | "x+1"
  | "y+1"
  | "x-1"
  | "y-1"
  | "x+y"
  | "x-y"
  | "y-x"
  | "x&y"
  | "x|y";

export const COMMANDS_ALU: {
  op: Record<COMMANDS_OP, COMMANDS_ALU>;
} = {
  op: {
    0x2a: "0",
    0x3f: "1",
    0x3a: "-1",
    0x0c: "x",
    0x30: "y",
    0x0d: "!x",
    0x31: "!y",
    0x0f: "-x",
    0x33: "-y",
    0x1f: "x+1",
    0x37: "y+1",
    0x0e: "x-1",
    0x32: "y-1",
    0x02: "x+y",
    0x13: "x-y",
    0x07: "y-x",
    0x00: "x&y",
    0x15: "x|y",
  },
};

export const COMMANDS: {
  asm: Record<COMMANDS_ASM, COMMANDS_OP>;
  op: Record<COMMANDS_OP, COMMANDS_ASM>;
  getOp: (asm: string) => COMMANDS_OP;
} = {
  asm: {
    "0": 0b101010, // 42 0x2A
    "1": 0b111111, // 63 0x3F
    "-1": 0b111010, // 58 0x3A
    D: 0b001100, // 12 0x0C
    A: 0b110000, // 48 0x30
    "!D": 0b001101, // 13 0x0D
    "!A": 0b110001, // 49 0x31
    "-D": 0b001111, // 15 0x0F
    "-A": 0b110011, // 51 0x33
    "D+1": 0b011111, // 31 0x1F
    "A+1": 0b110111, // 55 0x37
    "D-1": 0b001110, // 14 0x0E
    "A-1": 0b110010, // 50 0x32
    "D+A": 0b000010, //  2 0x02
    "D-A": 0b010011, // 19 0x13
    "A-D": 0b000111, //  7 0x07
    "D&A": 0b000000, //  0 0x00
    "D|A": 0b010101, // 21 0x15
  },
  op: {
    0x2a: "0",
    0x3f: "1",
    0x3a: "-1",
    0x0c: "D",
    0x30: "A",
    0x0d: "!D",
    0x31: "!A",
    0x0f: "-D",
    0x33: "-A",
    0x1f: "D+1",
    0x37: "A+1",
    0x0e: "D-1",
    0x32: "A-1",
    0x02: "D+A",
    0x13: "D-A",
    0x07: "A-D",
    0x00: "D&A",
    0x15: "D|A",
  },
  getOp(asm: string) {
    return COMMANDS.asm[asm.replace("M", "A") as COMMANDS_ASM];
  },
};

const assignAsmValues = new Set([
  "",
  "M",
  "D",
  "MD",
  "A",
  "AM",
  "AD",
  "AMD",
] as const);

export type ASSIGN_ASM = typeof assignAsmValues extends Set<infer S>
  ? S
  : never;

export type ASSIGN_OP = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function isAssignAsm(assign: unknown): assign is ASSIGN_ASM {
  return assignAsmValues.has(assign as ASSIGN_ASM);
}

export const ASSIGN: {
  asm: Record<ASSIGN_ASM, ASSIGN_OP>;
  op: Record<ASSIGN_OP, ASSIGN_ASM>;
} = {
  asm: {
    "": 0x0,
    M: 0b001,
    D: 0b010,
    MD: 0b011,
    A: 0b100,
    AM: 0b101,
    AD: 0b110,
    AMD: 0b111,
  },
  op: {
    0x0: "",
    0x1: "M",
    0x2: "D",
    0x3: "MD",
    0x4: "A",
    0x5: "AM",
    0x6: "AD",
    0x7: "AMD",
  },
};

const jumpAsmValues = new Set([
  "",
  "JGT",
  "JEQ",
  "JGE",
  "JLT",
  "JNE",
  "JLE",
  "JMP",
] as const);

export type JUMP_ASM = typeof jumpAsmValues extends Set<infer S> ? S : never;
export type JUMP_OP = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function isJumpAsm(jump: unknown): jump is JUMP_ASM {
  return jumpAsmValues.has(jump as JUMP_ASM);
}

export const JUMP: {
  asm: Record<JUMP_ASM, JUMP_OP>;
  op: Record<JUMP_OP, JUMP_ASM>;
} = {
  asm: {
    "": 0b0,
    JGT: 0b001,
    JEQ: 0b010,
    JGE: 0b011,
    JLT: 0b100,
    JNE: 0b101,
    JLE: 0b110,
    JMP: 0b111,
  },
  op: {
    0x0: "",
    0x1: "JGT",
    0x2: "JEQ",
    0x3: "JGE",
    0x4: "JLT",
    0x5: "JNE",
    0x6: "JLE",
    0x7: "JMP",
  },
};

export const Flags = {
  0x01: "Positive",
  0x00: "Zero",
  0x0f: "Negative",
  Positive: 0x01,
  Zero: 0x00,
  Negative: 0x0f,
};

export function alu(op: number, d: number, a: number): [number, number] {
  let o = 0;
  switch (op) {
    case 0x2a:
      o = 0;
      break;
    case 0x3f:
      o = 1;
      break;
    case 0x3a:
      o = -1;
      break;
    case 0x0c:
      o = d;
      break;
    case 0x30:
      o = a;
      break;
    case 0x0d:
      o = ~d;
      break;
    case 0x31:
      o = ~a;
      break;
    case 0x0f:
      o = -d;
      break;
    case 0x33:
      o = -a;
      break;
    case 0x1f:
      o = d + 1;
      break;
    case 0x37:
      o = a + 1;
      break;
    case 0x0e:
      o = d - 1;
      break;
    case 0x32:
      o = a - 1;
      break;
    case 0x02:
      o = d + a;
      break;
    case 0x13:
      o = d - a;
      break;
    case 0x07:
      o = a - d;
      break;
    case 0x00:
      o = d & a;
      break;
    case 0x15:
      o = d | a;
      break;
  }

  o = o & 0xffff;
  const flags =
    o === 0 ? Flags.Zero : o & 0x8000 ? Flags.Negative : Flags.Positive;
  return [o, flags];
}

export function alua(op: number, d: number, a: number): [number, number] {
  if (op & 0b100000) d = 0;
  if (op & 0b010000) d = ~d & 0xffff;
  if (op & 0b001000) a = 0;
  if (op & 0b000100) a = ~a & 0xffff;

  let o = (op & 0b000010 ? d + a : d & a) & 0xffff;
  if (op & 0b000001) o = ~o & 0xffff;

  const flags =
    o === 0 ? Flags.Zero : o & 0x8000 ? Flags.Negative : Flags.Positive;
  return [o, flags];
}
