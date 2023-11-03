import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import * as loader from "./loader.js";

export async function load(fs: FileSystem, path: string): Promise<number[]> {
  if (path.endsWith(".hack")) {
    return loadHack(fs, path);
  }

  if (path.endsWith(".asm")) {
    return loadAsm(fs, path);
  }

  throw new Error(`Cannot load file without hack or asm extension ${path}`);
}

export async function loadAsm(fs: FileSystem, path: string): Promise<number[]> {
  return loader.loadAsm(await fs.readFile(path));
}

export async function loadHack(
  fs: FileSystem,
  path: string
): Promise<number[]> {
  return loader.loadHack(await fs.readFile(path));
}
