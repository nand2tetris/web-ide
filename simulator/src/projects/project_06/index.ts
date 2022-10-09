import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import { AddAsm, AddHack } from "./01_add.js";
import { MaxAsm, MaxHack } from "./02_max.js";
import { RectAsm, RectHack } from "./03_rect.js";
import { PongAsm, PongHack } from "./04_pong.js";
import { FillAsm, FillHack } from "./05_fill.js";

export const FILES = {
  "Add.asm": AddAsm,
  "Max.asm": MaxAsm,
  "Rect.asm": RectAsm,
  "Fill.asm": FillAsm,
  "Pong.asm": PongAsm,
};

export const ASM_SOLS: Record<keyof typeof FILES, number[]> = {
  "Add.asm": AddHack,
  "Max.asm": MaxHack,
  "Rect.asm": RectHack,
  "Fill.asm": FillHack,
  "Pong.asm": PongHack,
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/06");
  await reset(fs, FILES);
  await fs.popd();
}
