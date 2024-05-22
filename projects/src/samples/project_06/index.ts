import { FileSystem, reset } from "@davidsouther/jiffies/lib/esm/fs.js";
import { AddAsm, AddHack } from "./01_add.js";
import { MaxAsm, MaxHack, MaxLAsm } from "./02_max.js";
import { RectAsm, RectHack, RectLAsm } from "./03_rect.js";
import { PongAsm, PongHack, PongLAsm } from "./04_pong_asm.js";

export const FILES = {
  "Add.asm": AddAsm,
  "Max.asm": MaxAsm,
  "MaxL.asm": MaxLAsm,
  "Rect.asm": RectAsm,
  "RectL.asm": RectLAsm,
  "Pong.asm": PongAsm,
  "PongL.asm": PongLAsm,
};

export const ASM_SOLS: Record<keyof typeof FILES, number[]> = {
  "Add.asm": AddHack,
  "Max.asm": MaxHack,
  "MaxL.asm": MaxHack,
  "Rect.asm": RectHack,
  "RectL.asm": RectHack,
  "Pong.asm": PongHack,
  "PongL.asm": PongHack,
};

export async function resetFiles(fs: FileSystem): Promise<void> {
  await fs.pushd("/projects/06");
  await reset(fs, FILES);
  await fs.popd();
}

export async function resetTests(fs: FileSystem): Promise<void> {
  return;
}
