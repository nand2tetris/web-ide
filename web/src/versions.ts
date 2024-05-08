import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { resetFiles, resetTests } from "@nand2tetris/projects/index";

const VERSION_KEY = "version";
const CURRENT_VERSION = 7;

export function getVersion() {
  return Number(localStorage.getItem(VERSION_KEY) ?? "0");
}

export function setVersion(version: number) {
  localStorage.setItem(VERSION_KEY, version.toString());
}

export async function updateVersion(fs: FileSystem) {
  let version = getVersion();

  while (version < CURRENT_VERSION) {
    try {
      await versionUpdates[version](fs);
      version++;
    } catch (e) {
      console.warn(`Error loading files at version ${version}`, e);
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
    await resetFiles(fs, [4]);
  },
  2: async (fs: FileSystem) => {
    await resetTests(fs, [1]);
  },
  3: async (fs: FileSystem) => {
    await resetTests(fs);
  },
  4: async (fs: FileSystem) => {
    await resetFiles(fs, [7, 8]);
  },
  5: async (fs: FileSystem) => {
    await resetTests(fs, [3, 5]);
  },
  6: async (fs: FileSystem) => {
    await resetTests(fs, [4]);
  },
};
