import { SCREEN_SIZE } from "../cpu/memory.js";
import { VmMemory } from "./memory.js";
import { OS } from "./os/os.js";

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
    return Math.floor(Math.sqrt(x));
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
  "Screen.drawRect": (memory, os) => {
    const [x1, y1, x2, y2] = getArgs(memory, 4);
    os.screen.drawRect(x1, y1, x2, y2);
    return 0;
  },
  "Screen.drawCircle": (memory, os) => {
    const [x, y, r] = getArgs(memory, 3);
    os.screen.drawCircle(x, y, r);
    return 0;
  },
};
