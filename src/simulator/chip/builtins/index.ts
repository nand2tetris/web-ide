import { assert } from "@davidsouther/jiffies/assert.js";
import { Chip } from "../chip.js";

import { And, And16 } from "./logic/and.js";
import { Demux } from "./logic/demux.js";
import { Mux } from "./logic/mux.js";
import { Nand, Nand16 } from "./logic/nand.js";
import { Not, Not16 } from "./logic/not.js";
import { Or } from "./logic/or.js";
import { Xor } from "./logic/xor.js";

export { And, And16 } from "./logic/and.js";
export { Demux } from "./logic/demux.js";
export { Mux } from "./logic/mux.js";
export { Not, Not16 } from "./logic/not.js";
export { Or } from "./logic/or.js";
export { Xor } from "./logic/xor.js";

export const REGISTRY = new Map<string, () => Chip>(
  [Nand, Nand16, Not, Not16, And, And16, Or, Xor, Mux, Demux].map(
    (ChipCtor) => [
      ChipCtor.name,
      () => {
        const chip = new ChipCtor();
        chip.name = ChipCtor.name;
        return chip;
      },
    ]
  )
);

export function getBuiltinChip(name: string): Chip {
  assert(REGISTRY.has(name), `Chip ${name} not in builtin registry`);
  return REGISTRY.get(name)!();
}
