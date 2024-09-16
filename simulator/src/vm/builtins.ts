import {
  ReturnType,
  Subroutine,
  SubroutineType,
  Type,
} from "../languages/jack.js";
import { VmMemory } from "./memory.js";
import { ERRNO } from "./os/errors.js";
import { OS } from "./os/os.js";
import { BACKSPACE, DOUBLE_QUOTES, NEW_LINE } from "./os/string.js";

export type VmBuiltinFunction = (memory: VmMemory, os: OS) => number;

export interface VmBuiltin {
  func: VmBuiltinFunction;
  type: SubroutineType;
  args: Type[];
  returnType: ReturnType;
}

function getArgs(memory: VmMemory, n: number) {
  const args = [];
  for (let i = 0; i < n; i++) {
    args.push(memory.get(memory.SP - n + i));
  }
  return args;
}

export function overridesOsCorrectly(cls: string, subroutine: Subroutine) {
  const builtin = VM_BUILTINS[`${cls}.${subroutine.name.value}`];

  return (
    builtin &&
    builtin.args.length == subroutine.parameters.length &&
    builtin.args.every(
      (arg, index) => arg == subroutine.parameters[index].type.value,
    ) &&
    builtin.returnType == subroutine.returnType.value
  );
}

export function makeInterface(name: string, builtin: VmBuiltin) {
  return `${builtin.returnType} ${name}(${builtin.args.join(",")}`;
}

export const VM_BUILTINS: Record<string, VmBuiltin> = {
  "Math.init": {
    func: (_, __) => 0,
    args: [],
    returnType: "void",
    type: "function",
  },
  "Math.multiply": {
    func: (memory, _) => {
      const [a, b] = getArgs(memory, 2);
      return (a * b) & 0xffff;
    },
    args: ["int", "int"],
    returnType: "int",
    type: "function",
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
    args: ["int", "int"],
    returnType: "int",
    type: "function",
  },
  "Math.min": {
    func: (memory, _) => {
      const [a, b] = getArgs(memory, 2);
      return Math.min(a, b) & 0xffff;
    },
    args: ["int", "int"],
    returnType: "int",
    type: "function",
  },
  "Math.max": {
    func: (memory, _) => {
      const [a, b] = getArgs(memory, 2);
      return Math.max(a, b) & 0xffff;
    },
    args: ["int", "int"],
    returnType: "int",
    type: "function",
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
    args: ["int"],
    returnType: "int",
    type: "function",
  },
  "Math.abs": {
    func: (memory, _) => {
      const [x] = getArgs(memory, 1);
      return Math.abs(x) & 0xffff;
    },
    args: ["int"],
    returnType: "int",
    type: "function",
  },
  "Screen.init": {
    func: (_, __) => 0,
    args: [],
    returnType: "void",
    type: "function",
  },
  "Screen.clearScreen": {
    func: (_, os) => {
      os.screen.clear();
      return 0;
    },
    args: [],
    returnType: "void",
    type: "function",
  },
  "Screen.setColor": {
    func: (memory, os) => {
      const [color] = getArgs(memory, 1);
      os.screen.color = color !== 0;
      return 0;
    },
    args: ["boolean"],
    returnType: "void",
    type: "function",
  },
  "Screen.drawPixel": {
    func: (memory, os) => {
      const [x, y] = getArgs(memory, 2);
      os.screen.drawPixel(x, y);
      return 0;
    },
    args: ["int", "int"],
    returnType: "void",
    type: "function",
  },
  "Screen.drawLine": {
    func: (memory, os) => {
      const [x1, y1, x2, y2] = getArgs(memory, 4);
      os.screen.drawLine(x1, y1, x2, y2);
      return 0;
    },
    args: ["int", "int", "int", "int"],
    returnType: "void",
    type: "function",
  },
  "Screen.drawRectangle": {
    func: (memory, os) => {
      const [x1, y1, x2, y2] = getArgs(memory, 4);
      os.screen.drawRect(x1, y1, x2, y2);
      return 0;
    },
    args: ["int", "int", "int", "int"],
    returnType: "void",
    type: "function",
  },
  "Screen.drawCircle": {
    func: (memory, os) => {
      const [x, y, r] = getArgs(memory, 3);
      os.screen.drawCircle(x, y, r);
      return 0;
    },
    args: ["int", "int", "int"],
    returnType: "void",
    type: "function",
  },
  "Memory.init": {
    func: (_, __) => 0,
    args: [],
    returnType: "void",
    type: "function",
  },
  "Memory.peek": {
    func: (memory, _) => {
      const [address] = getArgs(memory, 1);
      return memory.get(address);
    },
    args: ["int"],
    returnType: "int",
    type: "function",
  },
  "Memory.poke": {
    func: (memory, _) => {
      const [address, value] = getArgs(memory, 2);
      memory.set(address, value);
      return 0;
    },
    args: ["int", "int"],
    returnType: "void",
    type: "function",
  },
  "Memory.alloc": {
    func: (memory, os) => {
      const [size] = getArgs(memory, 1);
      return os.memory.alloc(size);
    },
    args: ["int"],
    returnType: "Array",
    type: "function",
  },
  "Memory.deAlloc": {
    func: (memory, os) => {
      const [address] = getArgs(memory, 1);
      os.memory.deAlloc(address);
      return 0;
    },
    args: ["Array"],
    returnType: "void",
    type: "function",
  },
  "Array.init": {
    func: (_, __) => 0,
    args: [],
    returnType: "void",
    type: "function",
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
    args: ["int"],
    returnType: "Array",
    type: "constructor",
  },
  "Array.dispose": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.memory.deAlloc(pointer);
      return 0;
    },
    args: [],
    returnType: "void",
    type: "method",
  },
  "String.init": {
    func: (_, __) => 0,
    args: [],
    returnType: "void",
    type: "function",
  },
  "String.new": {
    func: (memory, os) => {
      const [length] = getArgs(memory, 1);
      return os.string.new(length);
    },
    args: ["int"],
    returnType: "String",
    type: "constructor",
  },
  "String.dispose": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.string.dispose(pointer);
      return 0;
    },
    args: [],
    returnType: "void",
    type: "method",
  },
  "String.length": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      return os.string.length(pointer);
    },
    args: [],
    returnType: "int",
    type: "method",
  },
  "String.charAt": {
    func: (memory, os) => {
      const [pointer, index] = getArgs(memory, 2);
      return os.string.charAt(pointer, index);
    },
    args: ["int"],
    returnType: "char",
    type: "method",
  },
  "String.setCharAt": {
    func: (memory, os) => {
      const [pointer, index, value] = getArgs(memory, 3);
      os.string.setCharAt(pointer, index, value);
      return 0;
    },
    args: ["int", "char"],
    returnType: "void",
    type: "method",
  },
  "String.appendChar": {
    func: (memory, os) => {
      const [pointer, value] = getArgs(memory, 2);
      return os.string.appendChar(pointer, value);
    },
    args: ["char"],
    returnType: "String",
    type: "method",
  },
  "String.eraseLastChar": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.string.eraseLastChar(pointer);
      return 0;
    },
    args: [],
    returnType: "void",
    type: "method",
  },
  "String.intValue": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      return os.string.intValue(pointer);
    },
    args: [],
    returnType: "int",
    type: "method",
  },
  "String.setInt": {
    func: (memory, os) => {
      const [pointer, value] = getArgs(memory, 2);
      os.string.setInt(pointer, value);
      return 0;
    },
    args: ["int"],
    returnType: "void",
    type: "method",
  },
  "String.backSpace": {
    func: (_, __) => {
      return BACKSPACE;
    },
    args: [],
    returnType: "char",
    type: "function",
  },
  "String.doubleQuote": {
    func: (_, __) => {
      return DOUBLE_QUOTES;
    },
    args: [],
    returnType: "char",
    type: "function",
  },
  "String.newLine": {
    func: (_, __) => {
      return NEW_LINE;
    },
    args: [],
    returnType: "char",
    type: "function",
  },
  "Output.init": {
    func: (_, __) => 0,
    args: [],
    returnType: "void",
    type: "function",
  },
  "Output.moveCursor": {
    func: (memory, os) => {
      const [i, j] = getArgs(memory, 2);
      os.output.moveCursor(i, j);
      return 0;
    },
    args: ["int", "int"],
    returnType: "void",
    type: "function",
  },
  "Output.printChar": {
    func: (memory, os) => {
      const [code] = getArgs(memory, 1);
      os.output.printChar(code);
      return 0;
    },
    args: ["char"],
    returnType: "void",
    type: "function",
  },
  "Output.printString": {
    func: (memory, os) => {
      const [pointer] = getArgs(memory, 1);
      os.output.printString(pointer);
      return 0;
    },
    args: ["String"],
    returnType: "void",
    type: "function",
  },
  "Output.printInt": {
    func: (memory, os) => {
      const [value] = getArgs(memory, 1);
      os.output.printInt(value);
      return 0;
    },
    args: ["int"],
    returnType: "void",
    type: "function",
  },
  "Output.println": {
    func: (_, os) => {
      os.output.println();
      return 0;
    },
    args: [],
    returnType: "void",
    type: "function",
  },
  "Output.backSpace": {
    func: (_, os) => {
      os.output.backspace();
      return 0;
    },
    args: [],
    returnType: "void",
    type: "function",
  },
  "Keyboard.init": {
    func: (_, __) => 0,
    args: [],
    returnType: "void",
    type: "function",
  },
  "Keyboard.keyPressed": {
    func: (_, os) => {
      return os.keyboard.keyPressed();
    },
    args: [],
    returnType: "char",
    type: "function",
  },
  "Keyboard.readChar": {
    func: (_, os) => {
      os.keyboard.readChar();
      return 0;
    },
    args: [],
    returnType: "char",
    type: "function",
  },
  "Keyboard.readLine": {
    func: (memory, os) => {
      const [message] = getArgs(memory, 1);
      os.keyboard.readLine(message);
      return 0;
    },
    args: ["String"],
    returnType: "String",
    type: "function",
  },
  "Keyboard.readInt": {
    func: (memory, os) => {
      const [message] = getArgs(memory, 1);
      os.keyboard.readInt(message);
      return 0;
    },
    args: ["String"],
    returnType: "int",
    type: "function",
  },
  "Sys.halt": {
    func: (_, os) => {
      os.sys.halt();
      return 0;
    },
    args: [],
    returnType: "void",
    type: "function",
  },
  "Sys.error": {
    func: (memory, os) => {
      const [code] = getArgs(memory, 1);
      os.sys.error(code);
      return 0;
    },
    args: ["int"],
    returnType: "void",
    type: "function",
  },
  "Sys.wait": {
    func: (memory, os) => {
      const [ms] = getArgs(memory, 1);
      os.sys.wait(ms);
      return 0;
    },
    args: ["int"],
    returnType: "void",
    type: "function",
  },
};
