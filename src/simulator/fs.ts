import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { int2 } from "../util/twos";

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
  return [];
}

export async function loadHack(
  fs: FileSystem,
  path: string
): Promise<number[]> {
  return (await fs.readFile(path))
    .split("\n")
    .filter((line) => line.trim() !== "")
    .map(int2);
}
