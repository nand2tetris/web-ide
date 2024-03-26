import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";

import { cleanup, resetBySuffix } from "../reset.js";
import * as HalfAdder from "./01_half_adder.js";
import * as FullAdder from "./02_full_adder.js";
import * as Add16 from "./03_add16.js";
import * as Inc16 from "./04_inc16.js";
import * as Alu from "./06_alu.js";

export const CHIPS = {
  HalfAdder: {
    "HalfAdder.hdl": HalfAdder.hdl,
    "HalfAdder.tst": HalfAdder.tst,
    "HalfAdder.cmp": HalfAdder.cmp,
  },
  FullAdder: {
    "FullAdder.hdl": FullAdder.hdl,
    "FullAdder.tst": FullAdder.tst,
    "FullAdder.cmp": FullAdder.cmp,
  },
  Add16: {
    "Add16.hdl": Add16.hdl,
    "Add16.tst": Add16.tst,
    "Add16.cmp": Add16.cmp,
  },
  Inc16: {
    "Inc16.hdl": Inc16.hdl,
    "Inc16.tst": Inc16.tst,
    "Inc16.cmp": Inc16.cmp,
  },
  ALU: {
    "ALU.hdl": Alu.hdl,
    "ALU.tst": Alu.tst,
    "ALU.cmp": Alu.cmp,
    "ALU-basic.tst": Alu.basic_tst,
    "ALU-basic.cmp": Alu.basic_cmp,
  },
};

export const BUILTIN_CHIPS = {};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/2");
  await reset(fs, CHIPS);
  await fs.popd();
}

export async function resetTests(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/2");
  await resetBySuffix(fs, CHIPS, ".tst");
  await resetBySuffix(fs, CHIPS, ".cmp");
  await fs.popd();
}

export async function cleanupFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/2");
  await cleanup(fs, CHIPS);
  await fs.popd();
}
