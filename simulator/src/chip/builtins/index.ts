import {
  Err,
  isErr,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { parse } from "../builder.js";
import { Chip } from "../chip.js";
import { Add16 } from "./arithmetic/add_16.js";
import { ALU, ALUNoStat } from "./arithmetic/alu.js";
import { FullAdder } from "./arithmetic/full_adder.js";
import { HalfAdder } from "./arithmetic/half_adder.js";
import { Inc16 } from "./arithmetic/inc16.js";
import { builtinOverrides } from "./builtinOverrides.js";
import {
  Computer,
  CPU,
  Keyboard,
  Memory,
  ROM32K,
  Screen,
} from "./computer/computer.js";
import { And, And16 } from "./logic/and.js";
import { DMux, DMux4Way, DMux8Way } from "./logic/dmux.js";
import { Mux, Mux4Way16, Mux8Way16, Mux16 } from "./logic/mux.js";
import { Nand, Nand16 } from "./logic/nand.js";
import { Not, Not16 } from "./logic/not.js";
import { Or, Or8way, Or16 } from "./logic/or.js";
import { Xor, Xor16 } from "./logic/xor.js";
import { Bit, PC, Register, VRegister } from "./sequential/bit.js";
import { DFF } from "./sequential/dff.js";
import { RAM4K, RAM8, RAM16K, RAM64, RAM512 } from "./sequential/ram.js";

export {
  Add16,
  ALU,
  And,
  And16,
  VRegister as ARegister,
  Bit,
  DFF,
  DMux,
  VRegister as DRegister,
  FullAdder,
  HalfAdder,
  Inc16,
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
  RAM16K,
  RAM4K,
  RAM512,
  RAM64,
  RAM8,
  Register,
  Xor,
  Xor16,
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
      ["ARegister", Register],
      ["DRegister", Register],
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
      ["ARegister", VRegister],
      ["DRegister", VRegister],
    ] as [string, { new (): Chip }][]
  ).map(([name, ChipCtor]) => [
    name,
    () => {
      const chip = new ChipCtor();
      chip.name = name;
      return chip;
    },
  ]),
);

export function hasBuiltinChip(name: string): boolean {
  return REGISTRY.has(name);
}

export async function getBuiltinChip(name: string): Promise<Result<Chip>> {
  if (builtinOverrides[name]) {
    const result = await parse(builtinOverrides[name], name);
    if (isErr(result)) {
      return Err(new Error(Err(result).message));
    }
    return result;
  }
  const chip = REGISTRY.get(name);
  return chip
    ? Ok(chip())
    : Err(new Error(`Chip ${name} not in builtin registry`));
}
