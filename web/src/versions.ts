import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

const CURRENT_VERSION = 1;

export async function updateVersion(fs: FileSystem) {
  let version = Number(localStorage.getItem("version")) ?? 0;

  while (version < CURRENT_VERSION) {
    await versionUpdates[version](fs);
    version++;
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
};
