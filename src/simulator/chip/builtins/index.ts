import { assert } from "@davidsouther/jiffies/assert.js";
import { Chip } from "../chip.js";
import { Add16 } from "./arithmetic/add_16.js";
import { ALU, ALUNoStat } from "./arithmetic/alu.js";
import { FullAdder } from "./arithmetic/full_adder.js";
import { HalfAdder } from "./arithmetic/half_adder.js";
import { Inc16 } from "./arithmetic/inc16.js";

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
  [
    ["Nand", Nand],
    ["Nand16", Nand16],
    ["Not", Not],
    ["Not16", Not16],
    ["And", And],
    ["And16", And16],
    ["Or", Or],
    ["Xor", Xor],
    ["Mux", Mux],
    ["Demux", Demux],
    ["HalfAdder", HalfAdder],
    ["FullAdder", FullAdder],
    ["Add16", Add16],
    ["Inc16", Inc16],
    ["ALU", ALU],
    ["ALUNoStat", ALUNoStat],
  ].map(([name, ChipCtor]: [string, () => Chip]) => [
    name,
    () => {
      const chip = new ChipCtor();
      chip.name = name;
      return chip;
    },
  ])
);

export function getBuiltinChip(name: string): Chip {
  assert(REGISTRY.has(name), `Chip ${name} not in builtin registry`);
  return REGISTRY.get(name)!();
}
