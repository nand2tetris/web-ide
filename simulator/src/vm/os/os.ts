import { VmMemory } from "../memory.js";
import { KeyboardLib } from "./keyboard.js";
import { MemoryLib } from "./memory.js";
import { OutputLib } from "./output.js";
import { ScreenLib } from "./screen.js";
import { StringLib } from "./string.js";
import { SysLib } from "./sys.js";

export interface OS {
  screen: ScreenLib;
  memory: MemoryLib;
  string: StringLib;
  output: OutputLib;
  keyboard: KeyboardLib;
  sys: SysLib;
}

export function initOs(memory: VmMemory): OS {
  const memoryLib = new MemoryLib(memory);
  const screen = new ScreenLib(memory);
  const string = new StringLib(memory, memoryLib);
  const output = new OutputLib(screen, string);
  const sys = new SysLib();
  const keyboard = new KeyboardLib(memory, output, string, sys);
  return {
    memory: memoryLib,
    screen,
    string,
    output,
    keyboard,
    sys,
  };
}
