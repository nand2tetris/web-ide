import { Tree } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

export async function resetBySuffix(
  fs: FileSystem,
  tree: Tree,
  suffix: string
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

// Removes all files and directories not in the tree.
export async function cleanup(fs: FileSystem, tree: Tree) {
  for (const entry of await fs.scandir(fs.cwd())) {
    let inTree = false;
    for (const [name, file] of Object.entries(tree)) {
      if (entry.name == name) {
        inTree = true;
        if (entry.isDirectory()) {
          fs.cd(entry.name);
          await cleanup(fs, file as Tree);
          fs.cd("..");
        }
      }
    }
    if (!inTree) {
      fs.rm(entry.name);
    }
  }
}
