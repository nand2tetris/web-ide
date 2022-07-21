import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs";

import * as Bit from "./01_bit";
import * as Register from "./02_register";
import * as PC from "./03_pc";
import * as RAM8 from "./04_ram8";
import * as RAM64 from "./05_ram64";
import * as RAM512 from "./06_ram512";
import * as RAM4k from "./07_ram4k";
import * as RAM16k from "./08_ram16k";

export const CHIPS = {
  Bit: {
    "Bit.hdl": Bit.hdl,
    "Bit.tst": Bit.tst,
    "Bit.cmp": Bit.cmp,
  },
  Register: {
    "Register.hdl": Register.hdl,
    "Register.tst": Register.tst,
    "Register.cmp": Register.cmp,
  },
  PC: {
    "PC.hdl": PC.hdl,
    "PC.tst": PC.tst,
    "PC.cmp": PC.cmp,
  },
  RAM8: {
    "RAM8.hdl": RAM8.hdl,
    "RAM8.tst": RAM8.tst,
    "RAM8.cmp": RAM8.cmp,
  },
  RAM64: {
    "RAM64.hdl": RAM64.hdl,
    "RAM64.tst": RAM64.tst,
    "RAM64.cmp": RAM64.cmp,
  },
  RAM512: {
    "RAM512.hdl": RAM512.hdl,
    "RAM512.tst": RAM512.tst,
    "RAM512.cmp": RAM512.cmp,
  },
  RAM4k: {
    "RAM4k.hdl": RAM4k.hdl,
    "RAM4k.tst": RAM4k.tst,
    "RAM4k.cmp": RAM4k.cmp,
  },
  RAM16k: {
    "RAM16k.hdl": RAM16k.hdl,
    "RAM16k.tst": RAM16k.tst,
    "RAM16k.cmp": RAM16k.cmp,
  },
};

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

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/03");
  await reset(fs, CHIPS);
  await fs.popd();
}

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/03");
  await reset(fs, SOLS);
  await fs.popd();
}
