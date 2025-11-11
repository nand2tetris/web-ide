import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import { resetBySuffix } from "../reset.js";
import * as Mult from "./01_mult.js";
import * as Fill from "./02_fill.js";

export const TESTS = {
  Mult: {
    "Mult.asm": Mult.asm,
    "Mult.tst": Mult.tst,
    "Mult.cmp": Mult.cmp,
  },
  Fill: {
    "Fill.asm": Fill.asm,
    "Fill.tst": Fill.tst,
    "FillAutomatic.tst": Fill.autoTst,
    "FillAutomatic.cmp": Fill.autoCmp,
  },
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/04");
  await reset(fs, TESTS);
  await fs.popd();
}

export async function resetTests(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/04");
  await resetBySuffix(fs, TESTS, ".tst");
  await resetBySuffix(fs, TESTS, ".cmp");
  await fs.popd();
}
