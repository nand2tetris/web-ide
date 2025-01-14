import { VmMemory } from "../memory.js";
import { ERRNO } from "./errors.js";
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

export function intToCharArray(value: number) {
  return value
    .toString()
    .split("")
    .map((c) => c.charCodeAt(0));
}

export class StringLib {
  private memory: VmMemory;
  private os: OS;

  constructor(memory: VmMemory, os: OS) {
    this.memory = memory;
    this.os = os;
  }

  new(size: number) {
    if (size < 0) {
      this.os.sys.error(ERRNO.STRING_LENGTH_NEG);
    }
    const pointer = this.os.memory.alloc(size + 3); // +3 to save length, maxLength, charArray Ptr
    if (this.os.sys.halted) {
      // alloc returned with an error
      return 0;
    }

    this.memory.set(pointer, size); // set maxLength = size
    this.memory.set(pointer + 1, 0); // set length = 0
    this.memory.set(pointer + 2, this.os.memory.alloc(size)); // set charArrayPtr.
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

  private charArrayPointer(pointer: number) {
    return this.memory.get(pointer + 2);
  }

  charAt(pointer: number, index: number) {
    if (index < 0 || index >= this.length(pointer)) {
      this.os.sys.error(ERRNO.GET_CHAR_INDEX_OUT_OF_BOUNDS);
      return 0;
    }
    return this.memory.get(this.charArrayPointer(pointer) + index);
  }

  setCharAt(pointer: number, index: number, value: number) {
    if (index < 0 || index >= this.length(pointer)) {
      this.os.sys.error(ERRNO.SET_CHAR_INDEX_OUT_OF_BOUNDS);
      return;
    }
    this.memory.set(this.charArrayPointer(pointer) + index, value);
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
      this.os.sys.error(ERRNO.STRING_FULL);
      return 0;
    }
    this.setLength(pointer, length + 1);
    this.setCharAt(pointer, length, value);
    return pointer;
  }

  eraseLastChar(pointer: number) {
    const length = this.length(pointer);
    if (length == 0) {
      this.os.sys.error(ERRNO.STRING_EMPTY);
      return;
    }
    this.setLength(pointer, length - 1);
  }

  intValue(pointer: number) {
    const digits = [];
    const neg = this.charAt(pointer, 0) == 45; // minus sign
    const start = neg ? 1 : 0;
    for (let i = start; i < this.length(pointer); i++) {
      if (isDigit(this.charAt(pointer, i))) {
        digits.push(toInt(this.charAt(pointer, i)));
      } else {
        break;
      }
    }
    const value = digits.reduce((acc, digit) => acc * 10 + digit, 0);
    return neg ? -value : value;
  }

  setInt(pointer: number, value: number) {
    const chars = intToCharArray(value);
    if (chars.length > this.maxLength(pointer)) {
      this.os.sys.error(ERRNO.STRING_INSUFFICIENT_CAPACITY);
      return;
    }
    this.setLength(pointer, 0);
    for (const c of chars) {
      this.appendChar(pointer, c);
    }
  }
}
