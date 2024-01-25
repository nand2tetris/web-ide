import { VmMemory } from "../memory.js";
import { OS } from "./os.js";

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
  private os: OS;

  constructor(memory: VmMemory, os: OS) {
    this.memory = memory;
    this.os = os;
  }

  new(size: number) {
    if (size <= 0) {
      this.os.sys.error(14);
    }
    const pointer = this.os.memory.alloc(size + 2); // +2 to save length, maxLength fields
    if (this.os.sys.halted) {
      // alloc returned with an error
      return 0;
    }

    this.memory.set(pointer, size); // set maxLength = size
    this.memory.set(pointer + 1, 0); // set length = 0
    return pointer;
  }

  dispose(pointer: number) {
    this.os.memory.deAlloc(pointer);
  }

  private maxLength(pointer: number) {
    return this.memory.get(pointer);
  }

  length(pointer: number) {
    return this.memory.get(pointer + 1);
  }

  private setLength(pointer: number, length: number) {
    this.memory.set(pointer + 1, length);
  }

  charAt(pointer: number, index: number) {
    if (index < 0 || index >= this.length(pointer)) {
      this.os.sys.error(15);
      return 0;
    }
    return this.memory.get(pointer + index + 2); // +2 to skip the length fields
  }

  setCharAt(pointer: number, index: number, value: number) {
    if (index < 0 || index >= this.length(pointer)) {
      this.os.sys.error(16);
      return;
    }
    this.memory.set(pointer + index + 2, value);
  }

  // This returns the string pointer to allow compilation of string literals as described in the book,
  // i.e. to a series of instructions of the form:
  // call string.new 1
  // repeat:
  //    push constant <character-code>
  //    call String.appendChar 2
  appendChar(pointer: number, value: number) {
    const length = this.length(pointer);
    if (length == this.maxLength(pointer)) {
      this.os.sys.error(17);
      return 0;
    }
    this.setLength(pointer, length + 1);
    this.setCharAt(pointer, length, value);
    return pointer;
  }

  eraseLastChar(pointer: number) {
    const length = this.length(pointer);
    if (length == 0) {
      this.os.sys.error(18);
      return;
    }
    this.setLength(pointer, length - 1);
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
    const chars = intToCharArray(value);
    if (chars.length > this.maxLength(pointer)) {
      this.os.sys.error(19);
      return;
    }
    this.setLength(pointer, 0);
    for (const c of chars) {
      this.appendChar(pointer, c);
    }
  }
}
