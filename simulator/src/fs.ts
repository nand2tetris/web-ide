import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { ASM } from "./languages/asm.js";
import { int2 } from "./util/twos.js";

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
  const source = await fs.readFile(path);
  const parsed = ASM.parse(source);
  if (isErr(parsed)) {
    throw Err(parsed);
  }

  const asm = Ok(parsed);
  ASM.passes.fillLabel(asm);
  return ASM.passes.emit(asm);
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
