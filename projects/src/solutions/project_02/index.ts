import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";

import * as HalfAdder from "./01_half_adder.js";
import * as FullAdder from "./02_full_adder.js";
import * as Add16 from "./03_add16.js";
import * as Inc16 from "./04_inc16.js";
import * as Alu from "./05_alu_no_stat.js";
import * as AluStatus from "./06_alu.js";

export const SOLS = {
  HalfAdder: {
    "HalfAdder.hdl": HalfAdder.sol,
  },
  FullAdder: {
    "FullAdder.hdl": FullAdder.sol,
  },
  Add16: {
    "Add16.hdl": Add16.sol,
  },
  Inc16: {
    "Inc16.hdl": Inc16.sol,
  },
  AluNoStat: {
    "AluNoStat.hdl": Alu.sol,
  },
  ALU: {
    "ALU.hdl": AluStatus.sol,
  },
};

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/02");
  await reset(fs, SOLS);
  await fs.popd();
}
