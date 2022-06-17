import { FileSystem, reset } from "@davidsouther/jiffies/fs.js";

import * as HalfAdder from "./01_half_adder.js";
import * as FullAdder from "./02_full_adder.js";
import * as Add16 from "./03_add16.js";
import * as Inc16 from "./04_inc16.js";
import * as Alu from "./05_alu_no_stat.js";
import * as AluStatus from "./06_alu.js";

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/02");
  await reset(fs, {
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
    AluNoStat: {
      "AluNoStat.hdl": Alu.hdl,
      "AluNoStat.tst": Alu.tst,
      "AluNoStat.cmp": Alu.cmp,
    },
    ALU: {
      "ALU.hdl": AluStatus.hdl,
      "ALU.tst": AluStatus.tst,
      "ALU.cmp": AluStatus.cmp,
    },
  });
  await fs.popd();
}

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/02");
  await reset(fs, {
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
  });
  await fs.popd();
}
