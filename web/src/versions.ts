import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import * as project_04 from "@nand2tetris/projects/project_04/index.js";

const VERSION_KEY = "version";
const CURRENT_VERSION = 2;

export function getVersion() {
  return Number(localStorage.getItem(VERSION_KEY)) ?? 0;
}

export function setVersion(version: number) {
  localStorage.setItem(VERSION_KEY, version.toString());
}

export async function updateVersion(fs: FileSystem) {
  console.log("updating version");
  let version = getVersion();

  while (version < CURRENT_VERSION) {
    try {
      await versionUpdates[version](fs);
      version++;
    } catch (e) {
      version++;
    }
  }

  setVersion(CURRENT_VERSION);
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
