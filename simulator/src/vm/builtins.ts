import { SCREEN_SIZE } from "../cpu/memory.js";
import { VmMemory } from "./memory.js";
import { OS } from "./os/os.js";
import { BACKSPACE, DOUBLE_QUOTES, NEW_LINE } from "./os/string.js";

export type VmBuiltin = (memory: VmMemory, os: OS) => number;

function getArgs(memory: VmMemory, n: number) {
  const args = [];
  for (let i = 0; i < n; i++) {
    args.push(memory.get(memory.SP - n + i));
  }
  return args;
}

const BLANK_SCREEN = new Array(SCREEN_SIZE).fill(0);
export const VM_BUILTINS: Record<string, VmBuiltin> = {
  "Math.multiply": (memory, _) => {
    const [a, b] = getArgs(memory, 2);
    return (a * b) & 0xffff;
  },
  "Math.divide": (memory, _) => {
    const [a, b] = getArgs(memory, 2);
    return Math.floor(a / b) & 0xffff;
  },
  "Math.min": (memory, _) => {
    const [a, b] = getArgs(memory, 2);
    return Math.min(a, b) & 0xffff;
  },
  "Math.max": (memory, _) => {
    const [a, b] = getArgs(memory, 2);
    return Math.max(a, b) & 0xffff;
  },
  "Math.sqrt": (memory, _) => {
    const [x] = getArgs(memory, 1);
    return Math.floor(Math.sqrt(x)) & 0xffff;
  },
  "Math.abs": (memory, _) => {
    const [x] = getArgs(memory, 1);
    return Math.abs(x) & 0xffff;
  },
  "Screen.clearScreen": (memory, _) => {
    memory.screen.loadBytes(BLANK_SCREEN);
    return 0;
  },
  "Screen.setColor": (memory, os) => {
    const [color] = getArgs(memory, 1);
    os.screen.color = color !== 0;
    return 0;
  },
  "Screen.drawPixel": (memory, os) => {
    const [x, y] = getArgs(memory, 2);
    os.screen.drawPixel(x, y);
    return 0;
  },
  "Screen.drawLine": (memory, os) => {
    const [x1, y1, x2, y2] = getArgs(memory, 4);
    os.screen.drawLine(x1, y1, x2, y2);
    return 0;
  },
  "Screen.drawRectangle": (memory, os) => {
    const [x1, y1, x2, y2] = getArgs(memory, 4);
    os.screen.drawRect(x1, y1, x2, y2);
    return 0;
  },
  "Screen.drawCircle": (memory, os) => {
    const [x, y, r] = getArgs(memory, 3);
    os.screen.drawCircle(x, y, r);
    return 0;
  },
  "Memory.peek": (memory, _) => {
    const [address] = getArgs(memory, 1);
    return memory.get(address);
  },
  "Memory.poke": (memory, _) => {
    const [address, value] = getArgs(memory, 2);
    memory.set(address, value);
    return 0;
  },
  "Memory.alloc": (memory, os) => {
    const [size] = getArgs(memory, 1);
    return os.memory.alloc(size);
  },
  "Memory.deAlloc": (memory, os) => {
    const [address] = getArgs(memory, 1);
    os.memory.deAlloc(address);
    return 0;
  },
  "Array.new": (memory, os) => {
    const [size] = getArgs(memory, 1);
    return os.memory.alloc(size);
  },
  "Array.dispose": (memory, os) => {
    const [pointer] = getArgs(memory, 1);
    os.memory.deAlloc(pointer);
    return 0;
  },
  "String.new": (memory, os) => {
    const [length] = getArgs(memory, 1);
    return os.string.new(length);
  },
  "String.dispose": (memory, os) => {
    const [pointer] = getArgs(memory, 1);
    os.string.dispose(pointer);
    return 0;
  },
  "String.length": (memory, os) => {
    const [pointer] = getArgs(memory, 1);
    return os.string.length(pointer);
  },
  "String.charAt": (memory, os) => {
    const [pointer, index] = getArgs(memory, 2);
    return os.string.charAt(pointer, index);
  },
  "String.setCharAt": (memory, os) => {
    const [pointer, index, value] = getArgs(memory, 3);
    os.string.setCharAt(pointer, index, value);
    return 0;
  },
  "String.appendChar": (memory, os) => {
    const [pointer, value] = getArgs(memory, 2);
    return os.string.appendChar(pointer, value);
  },
  "String.eraseLastChar": (memory, os) => {
    const [pointer] = getArgs(memory, 1);
    os.string.eraseLastChar(pointer);
    return 0;
  },
  "String.intValue": (memory, os) => {
    const [pointer] = getArgs(memory, 1);
    return os.string.intValue(pointer);
  },
  "String.setInt": (memory, os) => {
    const [pointer, value] = getArgs(memory, 2);
    os.string.setInt(pointer, value);
    return 0;
  },
  "String.backSpace": (_, __) => {
    return BACKSPACE;
  },
  "String.doubleQuote": (_, __) => {
    return DOUBLE_QUOTES;
  },
  "String.newLine": (_, __) => {
    return NEW_LINE;
  },
  "Output.moveCursor": (memory, os) => {
    const [i, j] = getArgs(memory, 2);
    os.output.moveCursor(i, j);
    return 0;
  },
  "Output.printChar": (memory, os) => {
    const [code] = getArgs(memory, 1);
    os.output.printChar(code);
    return 0;
  },
  "Output.printString": (memory, os) => {
    const [pointer] = getArgs(memory, 1);
    os.output.printString(pointer);
    return 0;
  },
  "Output.printInt": (memory, os) => {
    const [value] = getArgs(memory, 1);
    os.output.printInt(value);
    return 0;
  },
  "Output.println": (_, os) => {
    os.output.println();
    return 0;
  },
  "Output.backSpace": (_, os) => {
    os.output.backspace();
    return 0;
  },
  "Keyboard.keyPressed": (_, os) => {
    return os.keyboard.keyPressed();
  },
  "Keyboard.readChar": (_, __) => {
    return 48; // TODO
  },
  "Keyboard.readLine": (_, os) => {
    // TODO
    const str = os.string.new(3);
    os.string.appendChar(str, 48);
    os.string.appendChar(str, 48);
    os.string.appendChar(str, 48);
    return str;
  },
  "Keyboard.readInt": (_, __) => {
    return 0; // TODO
  },
  "Sys.halt": (_, __) => {
    return 0; // TODO
  },
  "Sys.error": (_, __) => {
    return 0; // TODO
  },
  "Sys.wait": (_, __) => {
    return 0; // TODO
  },
};
