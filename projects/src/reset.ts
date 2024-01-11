import { Tree } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

export async function resetBySuffix(
  fs: FileSystem,
  tree: Tree,
  suffix: string
) {
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") {
      if (key.endsWith(`.${suffix}`)) {
        await fs.writeFile(key, value);
      }
    } else {
      fs.cd(key);
      await resetBySuffix(fs, value as Tree, suffix);
      fs.cd("..");
    }
  }
}
