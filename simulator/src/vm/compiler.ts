import {
  ASM as AsmMod,
  AsmInstruction,
  Pointer,
  emit,
  asmToInt,
  AsmToString,
} from "../languages/asm.js";
import { STATIC, TEMP, THIS } from "./memory.js";
import { BinOp, CmpOp, Segment, UnOp, VmFunction, VmOperation } from "./vm.js";

const { A, C, L, AC } = AsmMod;
const DATA_TEMP = "R13";
const MEMORY_TEMP = "R14";
const WRITE_DATA = AC(DATA_TEMP, "M", "D");
const WRITE_MEM = AC(MEMORY_TEMP, "M", "D");
const JUMP_ADDR = "R13";
const FRAME_ADDR = "R14";
const SP_ADDR = "R15";

type Asm = Array<string | AsmInstruction | Asm>;

const Load = (base: number, value: number): Asm => [
  AC(value, "D", "A"),
  AC(base, "M", "D"),
];

const Read = (base: Pointer | number): Asm => [AC(base, "D", "M")];
const Write = (base: Pointer | number): Asm => [AC(base, "M", "D")];

// Read a pointer and add the offset into D
const PointerOffset = (pointer: Pointer, offset: number): Asm => {
  const asm: Asm = [AC(pointer, "D", "M")];

  if (offset > 1) asm.push(AC(offset, "D", "D+A"));
  if (offset === 1) asm.push(C("D", "D+1"));
  if (offset === -1) asm.push(C("D", "D-1"));
  if (offset < -1) asm.push(AC(offset, "D", "D-A"));

  return asm;
};

// Read from Pointer+Offset into D
const ReadPointer = (pointer: Pointer, offset = 0): Asm => [
  PointerOffset(pointer, offset),
  C("A", "D"),
  C("D", "M"),
];

// Write from D to Pointer+Offset
const WritePointer = (pointer: Pointer, offset = 0): Asm => [
  // D to DATA
  WRITE_DATA,
  // Pointer Offset to MEM
  PointerOffset(pointer, offset),
  WRITE_MEM,
  // From DATA to MEM
  AC(DATA_TEMP, "D", "M"),
  AC(MEMORY_TEMP, "A", "M"),
  C("M", "D"),
];
const DEC_STACK: Asm = [AC("SP", "D", "M"), C("MD", "D-1")];
const INC_STACK: Asm = [AC("SP", "D", "M"), C("MD", "D+1")];
const PUSH = [WritePointer("SP"), INC_STACK];
const POP = [DEC_STACK, ReadPointer("SP")];

const POINTER = {
  argument: "ARG",
  local: "LCL",
  temp: "TMP",
  this: "THIS",
  that: "THAT",
} as const;
const OPCODES = {
  neg: "D=-D",
  not: "D=!D",
  add: "D=D+M",
  sub: "D=D-M",
  and: "D=D&M",
  or: "D=D|M",
} as const;
const JUMPS = {
  eq: "JEQ",
  lt: "JLT",
  gt: "JGT",
} as const;

const Push = (segment: Segment, offset: number): Asm => {
  const asm: Asm = [];

  // Load value to D
  switch (segment) {
    case "constant":
      asm.push(AC(offset, "D", "A"));
      break;
    case "static":
      asm.push(AC(STATIC + offset, "D", "M"));
      break;
    case "pointer":
      asm.push(AC(THIS + offset, "D", "M"));
      break;
    case "temp":
      asm.push(AC(TEMP + offset, "D", "M"));
      break;
    case "argument":
    case "local":
    case "this":
    case "that":
      asm.push(ReadPointer(POINTER[segment], offset));
      break;
  }

  // Write value
  asm.push(PUSH);
  return asm;
};

const Pop = (segment: Segment, offset: number): Asm => {
  if (segment === "constant") throw new Error("Cannot pop a constant");
  // Read value from M
  const asm: Asm = [POP];

  // Write value to M
  switch (segment) {
    case "static":
      asm.push(AC(STATIC + offset, "M", "D"));
      break;
    case "pointer":
      asm.push(AC(THIS + offset, "M", "D"));
      break;
    case "temp":
      asm.push(AC(TEMP + offset, "M", "D"));
      break;
    case "argument":
    case "local":
    case "this":
    case "that":
      asm.push(WritePointer(POINTER[segment], offset));
      break;
  }

  return asm;
};

const Bin = (op: BinOp) => [
  DEC_STACK,
  ReadPointer("SP", -1),
  WRITE_DATA,
  ReadPointer("SP"),
  A(DATA_TEMP),
  OPCODES[op],
  WritePointer("SP", -1),
];
const Un = (op: UnOp) => [
  ReadPointer("SP", -1),
  OPCODES[op],
  WritePointer("SP", -1),
];
const Cmp = (op: CmpOp) => [
  Bin("sub"),
  ReadPointer("SP", -1),
  IfThenElse(op),
  WritePointer("SP", -1),
];
const IfThenElse = (op: CmpOp) => {
  const then = nextSymbol(`${op}_then`);
  const end = nextSymbol(`${op}_end`);
  return [AC(then, "", "D", JUMPS[op]), FALSE, L(then), TRUE, L(end)];
};
const TRUE = [C("D", "-1")];
const FALSE = [C("D", "0")];

let symbol = 1000;
const nextSymbol = (base: string): string => `${base}_${symbol++}`;

type RegAddress = { reg: Pointer };
type PtrAddress = { ptr: Pointer; offset?: number };
type Address = RegAddress | PtrAddress;
const isPtrAddress = (a: Address): a is PtrAddress =>
  (a as PtrAddress).ptr !== undefined;

// Read from an Address to D
const ReadA = (src: Address): Asm =>
  isPtrAddress(src) ? ReadPointer(src.ptr, src.offset) : Read(src.reg);
// Write from D to an address
const WriteA = (dest: Address): Asm =>
  isPtrAddress(dest) ? WritePointer(dest.ptr, dest.offset) : Write(dest.reg);
const Move = (src: Address, dest: Address): Asm => {
  return [ReadA(src), WriteA(dest)];
};
const JumpIndirect = (src: Pointer) => [AC(src, "A", "M"), C("", "0", "JMP")];
const POP_FRAME: Asm[] = [
  Move({ ptr: FRAME_ADDR, offset: -1 }, { reg: "THAT" }),
  Move({ ptr: FRAME_ADDR, offset: -2 }, { reg: "THIS" }),
  Move({ ptr: FRAME_ADDR, offset: -3 }, { reg: "ARG" }),
  Move({ ptr: FRAME_ADDR, offset: -3 }, { reg: "LCL" }),
];
const PushFrame = (nArgs: number): Asm[] => [
  Move({ reg: "LCL" }, { ptr: "SP", offset: 0 }),
  Move({ reg: "ARG" }, { ptr: "SP", offset: 1 }),
  Move({ reg: "THIS" }, { ptr: "SP", offset: 2 }),
  Move({ reg: "THAT" }, { ptr: "SP", offset: 3 }),
  Move({ ptr: "SP", offset: 4 }, { reg: "ARG" }),
  AC("SP", "D", "M"),
  AC(4, "D", "D+A"),
];
const Call = (fn: string, args: number) => [
  PushFrame(args),
  AC(fn, "", "0", "JMP"),
  L(nextSymbol(`${fn}_return`)),
];
const RETURN = [
  Move({ reg: "LCL" }, { reg: FRAME_ADDR }),
  Move({ ptr: FRAME_ADDR, offset: -5 }, { reg: JUMP_ADDR }),
  Move({ ptr: "SP", offset: -1 }, { ptr: "ARG" }),
  Move({ reg: "ARG" }, { reg: SP_ADDR }),
  POP_FRAME,
  ReadA({ reg: SP_ADDR }),
  AC("SP", "M", "D+1"),
  JumpIndirect(JUMP_ADDR),
];

function stringAsm(i: string | Asm | AsmInstruction): string {
  if (Array.isArray(i)) return i.map(stringAsm).join("\n");
  if (typeof i === "string") {
    return i;
  }
  return AsmToString(i);
}

export class VmCompiler {
  constructor(private readonly functionMap: Record<string, VmFunction>) {}

  compile(): string {
    // Initialize the stack pointer to
    const hack: Asm = ["// Initialize stack pointer", Load(0, 256)];
    if (this.functionMap["__implicit"] !== undefined) {
      hack.push("// Start program");
      hack.push(this.compileFn(this.functionMap["__implicit"]));
    } else if (this.functionMap["Sys.init"] !== undefined) {
      hack.push(["// Sys.init program runner", AC("Sys.init", "", "0", "JMP")]);
    } else {
      throw new Error("No bootstrap entry found for Vm");
    }

    for (const fn of Object.values(this.functionMap)) {
      if (fn.name === "__implicit") continue;
      hack.push(this.compileFn(fn));
    }

    return stringAsm(hack);
  }

  compileFn(fn: VmFunction): Asm {
    const hackFn: Asm = [`// ${fn.name} ${fn.nVars}`, L(fn.name)];
    for (let i = 0; i < fn.nVars; i++) {
      // Write nVars zeros
      hackFn.push(
        this.compileOp({ op: "push", segment: "constant", offset: 0 })
      );
    }
    for (const op of fn.operations) {
      hackFn.push(
        // eslint-disable @typescript-eslint/no-explicit-any
        `// ${op.op} ${
          (op as any).segment ?? (op as any).name ?? (op as any).label
        } ${(op as any).value ?? (op as any).nArgs}`,
        // eslint-enable @typescript-eslint/no-explicit-any
        this.compileOp(op)
      );
    }

    return hackFn;
  }

  compileOp(op: VmOperation): Asm {
    switch (op.op) {
      case "push":
        return Push(op.segment, op.offset);
      case "pop":
        return Pop(op.segment, op.offset);
      case "add":
      case "sub":
      case "and":
      case "or":
        return Bin(op.op);
      case "neg":
      case "not":
        return Un(op.op);
      case "eq":
      case "lt":
      case "gt":
        return Cmp(op.op);
      case "goto": {
        return [AC(op.label, "", "0", "JMP")];
      }
      case "if-goto": {
        return [POP, AC(op.label, "", "D", "JNE")];
      }
      case "call": {
        return Call(op.name, op.nArgs);
      }
      case "return":
        return RETURN;
      case "label": {
        return [L(op.label)];
      }
    }
  }
}
