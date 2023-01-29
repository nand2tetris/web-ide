import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";

import * as Bit from "./01_bit.js";
import * as Register from "./02_register.js";
import * as PC from "./03_pc.js";
import * as RAM8 from "./04_ram8.js";
import * as RAM64 from "./05_ram64.js";
import * as RAM512 from "./06_ram512.js";
import * as RAM4k from "./07_ram4k.js";
import * as RAM16k from "./08_ram16k.js";

export const SOLS = {
  Bit: {
    "Bit.hdl": Bit.sol,
  },
  Register: {
    "Register.hdl": Register.sol,
  },
  PC: {
    "PC.hdl": PC.sol,
  },
  RAM8: {
    "RAM8.hdl": RAM8.sol,
  },
  RAM64: {
    "RAM64.hdl": RAM64.sol,
  },
  RAM512: {
    "RAM512.hdl": RAM512.sol,
  },
  RAM4k: {
    "RAM4k.hdl": RAM4k.sol,
  },
  RAM16k: {
    "RAM16k.hdl": RAM16k.sol,
  },
};

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/03");
  await reset(fs, SOLS);
  await fs.popd();
}
