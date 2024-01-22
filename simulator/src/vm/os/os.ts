import { VmMemory } from "../memory";
import { ScreenLib } from "./screen";

export interface OS {
  screen: ScreenLib;
}

export function initOs(memory: VmMemory): OS {
  return {
    screen: new ScreenLib(memory),
  };
}
