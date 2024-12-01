import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { resetFiles, resetTests } from "@nand2tetris/projects/loader.js";

const VERSION_KEY = "version";
const CURRENT_VERSION = 13;

export function getVersion() {
  return Number(localStorage.getItem(VERSION_KEY) ?? "0");
}

export function setVersion(version: number) {
  localStorage.setItem(VERSION_KEY, version.toString());
}

let version: number | undefined = undefined;

export async function updateVersion(fs: FileSystem) {
  if (version !== undefined) return version == CURRENT_VERSION;
  version = getVersion();

  try {
    await fs.stat("/projects/01/Not.hdl");
    for (; version < CURRENT_VERSION; version++) {
      try {
        await versionUpdates[version](fs);
      } catch (e) {
        console.warn(`Error loading files at version ${version}`, e);
      }
    }
  } catch (e) {
    await resetFiles(fs);
  }

  setVersion(version);
  return version == CURRENT_VERSION;
}

const versionUpdates: Record<number, (fs: FileSystem) => Promise<void>> = {
  0: async (fs: FileSystem) => {
    for (const suffix of ["hdl", "cmp", "tst"]) {
      try {
        await fs.writeFile(
          `/projects/01/Xor/Xor.${suffix}`,
          await fs.readFile(`/projects/01/XOr/XOr.${suffix}`),
        );
      } catch (e) {
        // The XOr file was probably never loaded
      }
    }
  },
  1: async (fs: FileSystem) => {
    await resetFiles(fs, ["4"]);
  },
  2: async (fs: FileSystem) => {
    await resetTests(fs, ["1"]);
  },
  3: async (fs: FileSystem) => {
    await resetTests(fs);
  },
  4: async (fs: FileSystem) => {
    await resetFiles(fs, ["7", "8"]);
  },
  5: async (fs: FileSystem) => {
    await resetTests(fs, ["3", "5"]);
  },
  6: async (fs: FileSystem) => {
    await resetTests(fs, ["4"]);
  },
  7: async (fs: FileSystem) => {
    await resetTests(fs, ["1"]);
  },
  8: async (fs: FileSystem) => {
    await resetFiles(fs, ["6"]);
  },
  9: async (fs: FileSystem) => {
    await resetTests(fs, ["5"]);
  },
  10: async (fs: FileSystem) => {
    await resetTests(fs, ["5"]);
  },
  11: async (fs: FileSystem) => {
    await resetTests(fs, ["1"]);
  },
  12: async (fs: FileSystem) => {
    for (const suffix of ["hdl", "cmp", "tst"]) {
      try {
        await fs.rm(`/projects/01/Xor/Xor.${suffix}`);
      } catch (e) {
        // The XOr file was probably never loaded
      }
    }
  },
  //   13: async (fs: FileSystem) => {
  //     await resetFiles(fs, ["0", "9", "10", "11", "12", "13"]);
  //   },
};
