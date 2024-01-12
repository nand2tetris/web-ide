import { SCREEN_SIZE } from "../cpu/memory.js";
import { VmMemory } from "./memory.js";

export type VmBuiltin = (memory: VmMemory) => number;

const BLANK_SCREEN = new Array(SCREEN_SIZE).fill(0);
export const VM_BUILTINS: Record<string, VmBuiltin> = {
  "Math.multiply": (memory) => {
    const sp = memory.SP;
    return (memory.get(sp - 2) * memory.get(sp - 1)) & 0xffff;
  },
  "Screen.clearScreen": (memory) => {
    memory.screen.loadBytes(BLANK_SCREEN);
    return 0;
  },
};
