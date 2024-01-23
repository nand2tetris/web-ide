import { VmMemory } from "../memory.js";
import { MemoryLib } from "./memory.js";

export const NEW_LINE = 128;
export const BACKSPACE = 129;
export const DOUBLE_QUOTES = 34;

function isDigit(char: number) {
  return char >= 48 && char <= 57;
}

function toInt(char: number) {
  return char - 48;
}

function toChar(digit: number) {
  return digit + 48;
}

export function intToCharArray(value: number) {
  return value
    .toString()
    .split("")
    .map((c) => toChar(Number(c)));
}

export class StringLib {
  private memory: VmMemory;
  private memoryLib: MemoryLib;

  constructor(memory: VmMemory, memoryLib: MemoryLib) {
    this.memoryLib = memoryLib;
    this.memory = memory;
  }

  new(size: number) {
    const pointer = this.memoryLib.alloc(size + 2); // +2 to save length, maxLength fields
    this.memory.set(pointer, size); // set maxLength = size
    this.memory.set(pointer + 1, 0); // set length = 0
    return pointer;
  }

  dispose(pointer: number) {
    this.memoryLib.deAlloc(pointer);
  }

  length(pointer: number) {
    return this.memory.get(pointer + 1);
  }

  charAt(pointer: number, index: number) {
    return this.memory.get(pointer + index + 2); // +2 to skip the length fields
  }

  setCharAt(pointer: number, index: number, value: number) {
    this.memory.set(pointer + index + 2, value);
  }

  // This returns the string pointer to allow compilation of string literals as described in the book,
  // i.e. to a series of instructions of the form:
  // call string.new 1
  // repeat:
  //    push constant <character-code>
  //    call String.appendChar 2
  appendChar(pointer: number, value: number) {
    const l = this.length(pointer);
    if (l == this.memory.get(pointer)) {
      // length == maxLength
      return pointer;
    }
    this.setCharAt(pointer, l, value);
    this.memory.set(pointer + 1, l + 1); // length = length + 1
    return pointer;
  }

  eraseLastChar(pointer: number) {
    const l = this.length(pointer);
    if (l > 0) {
      this.memory.set(pointer + 1, l - 1); // length = length - 1
    }
  }

  intValue(pointer: number) {
    const digits = [];
    for (let i = 0; i < this.length(pointer); i++) {
      if (isDigit(this.charAt(pointer, i))) {
        digits.push(toInt(this.charAt(pointer, i)));
      } else {
        break;
      }
    }
    return digits.reduce((acc, digit) => acc * 10 + digit, 0);
  }

  setInt(pointer: number, value: number) {
    for (const c of intToCharArray(value)) {
      this.appendChar(pointer, c);
    }
  }
}
