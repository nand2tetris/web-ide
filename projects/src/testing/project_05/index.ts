import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";

import * as Memory from "./01_memory.js";
import * as CPU from "./02_cpu.js";
import * as Computer from "./03_computer.js";

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

export async function loadSolutions(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/05");
  await reset(fs, SOLS);
  await fs.popd();
}
