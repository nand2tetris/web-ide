import { FileSystem, reset } from "@davidsouther/jiffies/fs.js";

import * as Memory from "./01_memory.js";
import * as CPU from "./02_cpu.js";
import * as Computer from "./03_computer.js";

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/05");
  await reset(fs, {
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
  });
  await fs.popd();
}

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/05");
  await reset(fs, {
    Memory: {
      "Memory.hdl": Memory.sol,
    },
    CPU: {
      "CPU.hdl": CPU.sol,
    },
    Computer: {
      "Computer.hdl": Computer.sol,
    },
  });
  await fs.popd();
}
