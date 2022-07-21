import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs";

import * as Memory from "./01_memory";
import * as CPU from "./02_cpu";
import * as Computer from "./03_computer";

export const CHIPS = {
  Memory: {
    "Memory.hdl": Memory.hdl,
    "Memory.tst": Memory.tst,
    "Memory.cmp": Memory.cmp,
  },
  CPU: {
    "CPU.hdl": CPU.hdl,
    "CPU.tst": CPU.tst,
    "CPU.cmp": CPU.cmp,
  },
  Computer: {
    "Computer.hdl": Computer.hdl,
    "Computer.tst": Computer.tst,
    "Computer.cmp": Computer.cmp,
    "Max.hack": Computer.hack,
  },
};

export const SOLS = {
  Memory: {
    "Memory.hdl": Memory.sol,
  },
  CPU: {
    "CPU.hdl": CPU.sol,
  },
  Computer: {
    "Computer.hdl": Computer.sol,
  },
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/05");
  await reset(fs, CHIPS);
  await fs.popd();
}

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/05");
  await reset(fs, SOLS);
  await fs.popd();
}
