import type { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { parse as buildChip } from "@nand2tetris/simulator/chip/builder.js";

export interface CustomChip {
  name: string;
  signature: string;
}

/** A completion is available only when the chip and its dependencies build. */
export async function customChipOf(
  source: string,
  dir: string | undefined,
  fs: FileSystem,
): Promise<CustomChip | undefined> {
  const built = await buildChip(source, dir, undefined, fs);
  if (isErr(built)) {
    return undefined;
  }
  const chip = Ok(built);
  const { name } = chip;
  if (name === undefined) {
    return undefined;
  }
  const pins = [...chip.ins.entries(), ...chip.outs.entries()];
  return {
    name,
    signature: `${name}(${pins.map((pin) => `${pin.name}= `).join(", ")});`,
  };
}
