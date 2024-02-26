import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";

import { resetBySuffix } from "../reset.js";
import * as Memory from "./01_memory.js";
import * as CPU from "./02_cpu.js";
import * as Computer from "./03_computer.js";
import * as Screen from "./04_screen.js";
import * as Keyboard from "./05_keyboard.js";
import * as DRegister from "./06_d_register.js";
import * as ARegister from "./07_a_register.js";
import * as ROM32K from "./08_rom32k.js";

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
    "CPU-external.tst": CPU.external_tst,
    "CPU-external.cmp": CPU.external_cmp,
  },
  Computer: {
    "Computer.hdl": Computer.hdl,
    "Computer.tst": Computer.add_tst,
    "Computer.cmp": Computer.add_cmp,
    "ComputerMax.tst": Computer.max_tst,
    "ComputerMax.cmp": Computer.max_cmp,
    "ComputerRect.tst": Computer.rect_tst,
    "ComputerRect.cmp": Computer.rect_cmp,
  },
};

export const BUILTIN_CHIPS = {
  Screen: Screen.hdl,
  Keyboard: Keyboard.hdl,
  DRegister: DRegister.hdl,
  ARegister: ARegister.hdl,
  ROM32K: ROM32K.hdl,
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/05");
  await reset(fs, CHIPS);
  await fs.popd();

  // Add files needed for the test scripts to run
  await fs.pushd("/samples");
  await fs.writeFile("Add.hack", Computer.add);
  await fs.writeFile("Max.hack", Computer.max);
  await fs.writeFile("Rect.hack", Computer.rect);
  await fs.popd();
}

export async function resetTests(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/05");
  await resetBySuffix(fs, CHIPS, ".tst");
  await resetBySuffix(fs, CHIPS, ".cmp");
  await fs.popd();
}
