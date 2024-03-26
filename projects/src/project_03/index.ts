import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";

import * as DFF from "./00_dff.js";
import * as Bit from "./01_bit.js";
import * as Register from "./02_register.js";
import * as PC from "./03_pc.js";
import * as RAM8 from "./04_ram8.js";
import * as RAM64 from "./05_ram64.js";
import * as RAM512 from "./06_ram512.js";
import * as RAM4k from "./07_ram4k.js";
import * as RAM16k from "./08_ram16k.js";
import { cleanup, resetBySuffix } from "../reset.js";

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
  RAM4K: {
    "RAM4K.hdl": RAM4k.hdl,
    "RAM4K.tst": RAM4k.tst,
    "RAM4K.cmp": RAM4k.cmp,
  },
  RAM16K: {
    "RAM16K.hdl": RAM16k.hdl,
    "RAM16K.tst": RAM16k.tst,
    "RAM16K.cmp": RAM16k.cmp,
  },
};

export const BUILTIN_CHIPS = {
  DFF: DFF.hdl,
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/3");
  await reset(fs, CHIPS);
  await fs.popd();
}

export async function resetTests(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/3");
  await resetBySuffix(fs, CHIPS, ".tst");
  await resetBySuffix(fs, CHIPS, ".cmp");
  await fs.popd();
}

export async function cleanupFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/3");
  await cleanup(fs, CHIPS);
  await fs.popd();
}
