import { Tree } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

export async function resetBySuffix(
  fs: FileSystem,
  tree: Tree,
  suffix: string,
) {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") {
      if (key.endsWith(`${suffix}`)) {
        await fs.writeFile(key, value);
      }
    } else {
      fs.cd(key);
      await resetBySuffix(fs, value as Tree, suffix);
      fs.cd("..");
    }
  }
}

export async function reset(
  fs: FileSystem,
  tree: Tree,
  base?: string,
  override = true,
) {
  const items = (await fs.scandir(base ?? "/")).map((item) => item.name);
  for (const [key, value] of Object.entries(tree)) {
    const path = `${base ? `${base}/` : ""}${key}`;
    if (typeof value === "string") {
      if (override || !items.includes(key)) {
        await fs.writeFile(path, value);
      }
    } else {
      await fs.mkdir(path);
      await reset(fs, value as Tree, path);
    }
  }
}
