import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

export async function resetFiles(fs: FileSystem, projects?: number[]) {
  (await import("./full.js")).resetFiles(fs, projects);
}

export async function resetTests(fs: FileSystem, projects?: number[]) {
  (await import("./full.js")).resetTests(fs, projects);
}

export async function createFiles(fs: FileSystem) {
  await (await import("./full.js")).createFiles(fs);
}

export async function loadSamples(fs: FileSystem) {
  (await import("./samples/index.js")).loadSamples(fs);
}

export async function loadSolutions(fs: FileSystem) {
  (await import("./testing/index.js")).loadSolutions(fs);
}

export const loaders = {
  resetFiles,
  loadSolutions,
  loadSamples,
};

export default loaders;
