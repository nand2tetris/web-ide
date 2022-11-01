import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";

export async function resetFiles(fs: FileSystem) {
  (await import("./index.js")).resetFiles(fs);
}

export async function loadSamples(fs: FileSystem) {
  (await import("./samples/index.js")).loadSamples(fs);
}

export async function loadSolutions(fs: FileSystem) {
  (await import("./solutions/index.js")).loadSolutions(fs);
}

export const loaders = {
  resetFiles,
  loadSolutions,
  loadSamples,
};

export default loaders;
