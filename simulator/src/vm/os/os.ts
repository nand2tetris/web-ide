import { VmMemory } from "../memory.js";
import { ScreenLib } from "./screen.js";

export interface OS {
  screen: ScreenLib;
}

export function initOs(memory: VmMemory): OS {
  return {
    screen: new ScreenLib(memory),
  };
}
