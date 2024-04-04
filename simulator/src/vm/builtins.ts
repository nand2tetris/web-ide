import { VmMemory } from "./memory.js";
import { ERRNO } from "./os/errors.js";
import { OS } from "./os/os.js";
import { BACKSPACE, DOUBLE_QUOTES, NEW_LINE } from "./os/string.js";

export type VmBuiltinFunction = (memory: VmMemory, os: OS) => number;

export interface VmBuiltin {
  func: VmBuiltinFunction;
  nArgs: number;
}

function getArgs(memory: VmMemory, n: number) {
  const args = [];
  for (let i = 0; i < n; i++) {
    args.push(memory.get(memory.SP - n + i));
  }
  return args;
}

export const VM_BUILTINS: Record<string, VmBuiltin> = {
  "Math.multiply": {
    func: (memory, _) => {
      const [a, b] = getArgs(memory, 2);
      return (a * b) & 0xffff;
    },
    nArgs: 2,
  },
  "Math.divide": {
    func: (memory, os) => {
      const [a, b] = getArgs(memory, 2);
      if (b == 0) {
        os.sys.error(ERRNO.DIVIDE_BY_ZERO);
        return 0;
      }
      return Math.floor(a / b) & 0xffff;
    },
    nArgs: 2,
  },
  "Math.min": {
    func: (memory, _) => {
      const [a, b] = getArgs(memory, 2);
      return Math.min(a, b) & 0xffff;
    },
    nArgs: 2,
  },
  "Math.max": {
    func: (memory, _) => {
      const [a, b] = getArgs(memory, 2);
      return Math.max(a, b) & 0xffff;
    },
    nArgs: 2,
  },
  "Math.sqrt": {
    func: (memory, os) => {
      const [x] = getArgs(memory, 1);
      if (x < 0) {
        os.sys.error(ERRNO.SQRT_NEG);
        return 0;
      }
      return Math.floor(Math.sqrt(x)) & 0xffff;
    },
    nArgs: 1,
  },
  "Math.abs": {
    func: (memory, _) => {
      const [x] = getArgs(memory, 1);
      return Math.abs(x) & 0xffff;
    },
    nArgs: 1,
  },
  "Screen.clearScreen": {
    func: (_, os) => {
      os.screen.clear();
      return 0;
    },
    nArgs: 0,
  },
  "Screen.setColor": {
    func: (memory, os) => {
      const [color] = getArgs(memory, 1);
      os.screen.color = color !== 0;
      return 0;
    },
    nArgs: 1,
  },
  "Screen.drawPixel": {
    func: (memory, os) => {
      const [x, y] = getArgs(memory, 2);
      os.screen.drawPixel(x, y);
      return 0;
    },
    nArgs: 2,
  },
  "Screen.drawLine": {
    func: (memory, os) => {
      const [x1, y1, x2, y2] = getArgs(memory, 4);
      os.screen.drawLine(x1, y1, x2, y2);
      return 0;
    },
    nArgs: 4,
  },
  "Screen.drawRectangle": {
    func: (memory, os) => {
      const [x1, y1, x2, y2] = getArgs(memory, 4);
      os.screen.drawRect(x1, y1, x2, y2);
      return 0;
    },
    nArgs: 4,
  },
  "Screen.drawCircle": {
    func: (memory, os) => {
      const [x, y, r] = getArgs(memory, 3);
      os.screen.drawCircle(x, y, r);
      return 0;
    },
    nArgs: 3,
  },
  "Memory.peek": {
    func: (memory, _) => {
      const [address] = getArgs(memory, 1);
      return memory.get(address);
    },
    nArgs: 1,
  },
  "Memory.poke": {
    func: (memory, _) => {
      const [address, value] = getArgs(memory, 2);
      memory.set(address, value);
      return 0;
    },
    nArgs: 2,
  },
  "Memory.alloc": {
    func: (memory, os) => {
      const [size] = getArgs(memory, 1);
      return os.memory.alloc(size);
    },
    nArgs: 1,
  },
  "Memory.deAlloc": {
    func: (memory, os) => {
      const [address] = getArgs(memory, 1);
      os.memory.deAlloc(address);
      return 0;
    },
    nArgs: 1,
  },
  "Array.new": {
    func: (memory, os) => {
      const [size] = getArgs(memory, 1);
      if (size <= 0) {
        os.sys.error(ERRNO.ARRAY_SIZE_NOT_POSITIVE);
        return 0;
      }
      return os.memory.alloc(size);
    },
    nArgs: 1,
  },
  "Array.dispose": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.memory.deAlloc(pointer);
      return 0;
    },
    nArgs: 1,
  },
  "String.new": {
    func: (memory, os) => {
      const [length] = getArgs(memory, 1);
      return os.string.new(length);
    },
    nArgs: 1,
  },
  "String.dispose": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.string.dispose(pointer);
      return 0;
    },
    nArgs: 1,
  },
  "String.length": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      return os.string.length(pointer);
    },
    nArgs: 1,
  },
  "String.charAt": {
    func: (memory, os) => {
      const [pointer, index] = getArgs(memory, 2);
      return os.string.charAt(pointer, index);
    },
    nArgs: 2,
  },
  "String.setCharAt": {
    func: (memory, os) => {
      const [pointer, index, value] = getArgs(memory, 3);
      os.string.setCharAt(pointer, index, value);
      return 0;
    },
    nArgs: 3,
  },
  "String.appendChar": {
    func: (memory, os) => {
      const [pointer, value] = getArgs(memory, 2);
      return os.string.appendChar(pointer, value);
    },
    nArgs: 2,
  },
  "String.eraseLastChar": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.string.eraseLastChar(pointer);
      return 0;
    },
    nArgs: 1,
  },
  "String.intValue": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      return os.string.intValue(pointer);
    },
    nArgs: 1,
  },
  "String.setInt": {
    func: (memory, os) => {
      const [pointer, value] = getArgs(memory, 2);
      os.string.setInt(pointer, value);
      return 0;
    },
    nArgs: 2,
  },
  "String.backSpace": {
    func: (_, __) => {
      return BACKSPACE;
    },
    nArgs: 0,
  },
  "String.doubleQuote": {
    func: (_, __) => {
      return DOUBLE_QUOTES;
    },
    nArgs: 0,
  },
  "String.newLine": {
    func: (_, __) => {
      return NEW_LINE;
    },
    nArgs: 0,
  },
  "Output.moveCursor": {
    func: (memory, os) => {
      const [i, j] = getArgs(memory, 2);
      os.output.moveCursor(i, j);
      return 0;
    },
    nArgs: 2,
  },
  "Output.printChar": {
    func: (memory, os) => {
      const [code] = getArgs(memory, 1);
      os.output.printChar(code);
      return 0;
    },
    nArgs: 1,
  },
  "Output.printString": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.output.printString(pointer);
      return 0;
    },
    nArgs: 1,
  },
  "Output.printInt": {
    func: (memory, os) => {
      const [value] = getArgs(memory, 1);
      os.output.printInt(value);
      return 0;
    },
    nArgs: 1,
  },
  "Output.println": {
    func: (_, os) => {
      os.output.println();
      return 0;
    },
    nArgs: 0,
  },
  "Output.backSpace": {
    func: (_, os) => {
      os.output.backspace();
      return 0;
    },
    nArgs: 0,
  },
  "Keyboard.keyPressed": {
    func: (_, os) => {
      return os.keyboard.keyPressed();
    },
    nArgs: 0,
  },
  "Keyboard.readChar": {
    func: (_, os) => {
      os.keyboard.readChar();
      return 0;
    },
    nArgs: 0,
  },
  "Keyboard.readLine": {
    func: (memory, os) => {
      const [message] = getArgs(memory, 1);
      os.keyboard.readLine(message);
      return 0;
    },
    nArgs: 1,
  },
  "Keyboard.readInt": {
    func: (memory, os) => {
      const [message] = getArgs(memory, 1);
      os.keyboard.readInt(message);
      return 0;
    },
    nArgs: 1,
  },
  "Sys.halt": {
    func: (_, os) => {
      os.sys.halt();
      return 0;
    },
    nArgs: 0,
  },
  "Sys.error": {
    func: (memory, os) => {
      const [code] = getArgs(memory, 1);
      os.sys.error(code);
      return 0;
    },
    nArgs: 1,
  },
  "Sys.wait": {
    func: (memory, os) => {
      const [ms] = getArgs(memory, 1);
      os.sys.wait(ms);
      return 0;
    },
    nArgs: 1,
  },
};
