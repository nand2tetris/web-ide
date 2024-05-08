import { VmMemory } from "../memory.js";
import { KeyboardLib } from "./keyboard.js";
import { MemoryLib } from "./memory.js";
import { OutputLib } from "./output.js";
import { ScreenLib } from "./screen.js";
import { StringLib } from "./string.js";
import { SysLib } from "./sys.js";

export class OS {
  private vmMemory: VmMemory;
  screen: ScreenLib;
  memory: MemoryLib;
  string: StringLib;
  output: OutputLib;
  keyboard: KeyboardLib;
  sys: SysLib;

  paused = false;

  constructor(memory: VmMemory) {
    this.vmMemory = memory;
    this.screen = new ScreenLib(this.vmMemory, this);
    this.memory = new MemoryLib(this.vmMemory, this);
    this.string = new StringLib(this.vmMemory, this);
    this.output = new OutputLib(this);
    this.keyboard = new KeyboardLib(this.vmMemory, this);
    this.sys = new SysLib(this);
  }

  dispose() {
    this.keyboard.dispose();
    this.sys.dispose();
  }
}
