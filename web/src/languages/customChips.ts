import type { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { isErr, Ok } from "@davidsouther/jiffies/result.ts";
import { parse as buildChip } from "@nand2tetris/simulator/chip/builder.js";

/** A chip the student wrote, as the HDL editor offers it to its parts. */
export interface CustomChip {
  name: string;
  signature: string;
}

/**
 * The custom chip that HDL source builds in `dir`, or nothing when the final
 * call reports any diagnostic for it or for a chip it loads. A chip that does
 * not build yet is not offered, so the editor never offers a pin list that
 * recovery guessed.
 */
export async function customChipOf(
  source: string,
  dir: string | undefined,
  fs: FileSystem,
): Promise<CustomChip | undefined> {
  // Recovery only adds diagnostics to a source that has one already.
  const built = await buildChip(source, dir, undefined, fs, {
    attemptRecovery: false,
  });
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
