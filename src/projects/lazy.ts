import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

export async function resetFiles(fs: FileSystem) {
  (await import(".")).resetFiles(fs);
}

export async function loadSamples(fs: FileSystem) {
  (await import(".")).loadSamples(fs);
}

export async function loadSolutions(fs: FileSystem) {
  (await import(".")).loadSolutions(fs);
}

export const loaders = {
  resetFiles,
  loadSolutions,
  loadSamples,
};

export default loaders;
