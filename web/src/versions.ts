import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import * as project_04 from "@nand2tetris/projects/project_04/index.js";

const CURRENT_VERSION = 2;

export async function updateVersion(fs: FileSystem) {
  console.log("updating version");
  let version = Number(localStorage.getItem("version")) ?? 0;

  while (version < CURRENT_VERSION) {
    try {
      await versionUpdates[version](fs);
      version++;
    } catch (e) {
      version++;
    }
  }

  localStorage.setItem("version", CURRENT_VERSION.toString());
}

const versionUpdates: Record<number, (fs: FileSystem) => Promise<void>> = {
  0: async (fs: FileSystem) => {
    for (const suffix of ["hdl", "cmp", "tst"]) {
      await fs.writeFile(
        `/projects/01/Xor/Xor.${suffix}`,
        await fs.readFile(`/projects/01/XOr/XOr.${suffix}`)
      );
    }
  },
  1: async (fs: FileSystem) => {
    await project_04.resetFiles(fs);
  },
};
