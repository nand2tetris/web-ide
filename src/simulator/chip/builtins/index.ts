import { Err, Ok, Result } from "@davidsouther/jiffies/src/result";
import { Chip } from "../chip"

import { And, And16 } from "./logic/and"
import { DMux, DMux4Way, DMux8Way } from "./logic/dmux"
import { Mux, Mux16, Mux4Way16, Mux8Way16 } from "./logic/mux"
import { Nand, Nand16 } from "./logic/nand"
import { Not, Not16 } from "./logic/not"
import { Or, Or16, Or8way } from "./logic/or"
import { Xor, Xor16 } from "./logic/xor"

import { Add16 } from "./arithmetic/add_16"
import { ALU, ALUNoStat } from "./arithmetic/alu"
import { FullAdder } from "./arithmetic/full_adder"
import { HalfAdder } from "./arithmetic/half_adder"
import { Inc16 } from "./arithmetic/inc16"

import { Bit, PC, Register } from "./sequential/bit"
import { DFF } from "./sequential/dff"
import { RAM16K, RAM4K, RAM512, RAM64, RAM8 } from "./sequential/ram"
import {
  Computer,
  CPU,
  Keyboard,
  Memory,
  ROM32K,
  Screen,
} from "./computer/computer"

export {
  And,
  And16,
  DMux,
  Mux,
  Mux16,
  Mux4Way16,
  Mux8Way16,
  Nand,
  Nand16,
  Not,
  Not16,
  Or,
  Or16,
  Or8way,
  Xor,
  Xor16,
  HalfAdder,
  FullAdder,
  Add16,
  Inc16,
  ALU,
  Bit,
  Register,
  DFF,
  RAM8,
  RAM64,
  RAM512,
  RAM4K,
  RAM16K,
};

export const REGISTRY = new Map<string, () => Chip>(
  (
    [
      ["Nand", Nand],
      ["Nand16", Nand16],
      ["Not", Not],
      ["Not16", Not16],
      ["And", And],
      ["And16", And16],
      ["Or", Or],
      ["Or16", Or16],
      ["Or8Way", Or8way],
      ["XOr", Xor],
      ["XOr16", Xor16],
      ["Xor", Xor],
      ["Xor16", Xor16],
      ["Mux", Mux],
      ["Mux16", Mux16],
      ["Mux4Way16", Mux4Way16],
      ["Mux8Way16", Mux8Way16],
      ["DMux", DMux],
      ["DMux4Way", DMux4Way],
      ["DMux8Way", DMux8Way],
      ["HalfAdder", HalfAdder],
      ["FullAdder", FullAdder],
      ["Add16", Add16],
      ["Inc16", Inc16],
      ["ALU", ALU],
      ["ALUNoStat", ALUNoStat],
      ["DFF", DFF],
      ["Bit", Bit],
      ["Register", Register],
      ["PC", PC],
      ["RAM8", RAM8],
      ["RAM64", RAM64],
      ["RAM512", RAM512],
      ["RAM4K", RAM4K],
      ["RAM16K", RAM16K],
      ["ROM32K", ROM32K],
      ["Screen", Screen],
      ["Keyboard", Keyboard],
      ["CPU", CPU],
      ["Computer", Computer],
      ["Memory", Memory],
    ] as [string, { new (): Chip }][]
  ).map(([name, ChipCtor]) => [
    name,
    () => {
      const chip = new ChipCtor();
      chip.name = name;
      return chip;
    },
  ])
);

export function getBuiltinChip(name: string): Result<Chip> {
  const chip = REGISTRY.get(name);
  return chip
    ? Ok(chip())
    : Err(new Error(`Chip ${name} not in builtin registry`));
}
