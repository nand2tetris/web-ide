import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { MemoryAdapter, SubMemory } from "@nand2tetris/simulator/cpu/memory.js";
import { MutableRefObject } from "react";

export class ImmMemory<
  Action extends { action: "update" },
  Dispatch extends (a: Action) => void
> extends SubMemory {
  constructor(
    parent: MemoryAdapter,
    private dispatch: MutableRefObject<Dispatch>
  ) {
    super(parent, parent.size, 0);
  }

  override async load(fs: FileSystem, path: string): Promise<void> {
    await super.load(fs, path);
    this.dispatch.current({ action: "update" } as Action);
  }
}
