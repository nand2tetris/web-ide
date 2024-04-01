import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import { AddAsm, AddHack } from "./01_add.js";
import { MaxAsm, MaxHack } from "./02_max.js";
import { RectAsm, RectHack } from "./03_rect.js";
import { PongAsm, PongHack } from "./04_pong_asm.js";

export const FILES = {
  "Add.asm": AddAsm,
  "Max.asm": MaxAsm,
  "Rect.asm": RectAsm,
  "Pong.asm": PongAsm,
};

export const ASM_SOLS: Record<keyof typeof FILES, number[]> = {
  "Add.asm": AddHack,
  "Max.asm": MaxHack,
  "Rect.asm": RectHack,
  "Pong.asm": PongHack,
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/06");
  await reset(fs, FILES);
  await fs.popd();
}

export async function resetTests(fs: FileSystem): Promise<void> {
  return;
}
