import { VmMemory } from "../memory.js";
import { KeyboardLib } from "./keyboard.js";
import { MemoryLib } from "./memory.js";
import { OutputLib } from "./output.js";
import { ScreenLib } from "./screen.js";
import { StringLib } from "./string.js";

export interface OS {
  screen: ScreenLib;
  memory: MemoryLib;
  string: StringLib;
  output: OutputLib;
  keyboard: KeyboardLib;
}

export function initOs(memory: VmMemory): OS {
  const memoryLib = new MemoryLib(memory);
  const screen = new ScreenLib(memory);
  const string = new StringLib(memory, memoryLib);
  const output = new OutputLib(screen, string);
  const keyboard = new KeyboardLib(memory, output, string);
  return {
    memory: memoryLib,
    screen,
    string,
    output,
    keyboard,
  };
}
