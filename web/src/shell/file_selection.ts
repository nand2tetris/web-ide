import type { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { FileSelectionRef, isPath, LocalFile, Path } from "./file_select";

// A file chosen through the file picker, whichever way it was chosen.
// `path` is only present when the file lives in the virtual fs; uploaded local files have none.
export interface PickedFile {
  name: string;
  path?: string;
  content: string;
}

export function baseName(path: string): string {
  return path.split("/").pop() ?? "";
}

function hasSuffix(name: string, suffix?: string | string[]): boolean {
  if (suffix === undefined) return true;
  return [suffix].flat().some((s) => name.endsWith(s));
}

export function isLocalSelection(
  ref: FileSelectionRef,
): ref is LocalFile | LocalFile[] {
  return !isPath(ref);
}

// Normalizes any picker result into a list of files with content.
// - Path to a file: read from `fs`.
// - Path to a folder: every direct child file matching `suffix`, read from `fs`.
// - LocalFile: already has content. A single explicitly chosen file is never filtered.
// - LocalFile[] (folder upload): filtered by `suffix` when given.
export async function readSelection(
  fs: Pick<FileSystem, "readFile" | "scandir">,
  ref: FileSelectionRef,
  suffix?: string | string[],
): Promise<PickedFile[]> {
  if (isPath(ref)) {
    return readPath(fs, ref, suffix);
  }
  if (Array.isArray(ref)) {
    return ref
      .filter((f) => hasSuffix(f.name, suffix))
      .map(({ name, content }) => ({ name, content }));
  }
  return [{ name: ref.name, content: ref.content }];
}

async function readPath(
  fs: Pick<FileSystem, "readFile" | "scandir">,
  { path, isDir }: Path,
  suffix?: string | string[],
): Promise<PickedFile[]> {
  if (!isDir) {
    return [{ name: baseName(path), path, content: await fs.readFile(path) }];
  }
  const files: PickedFile[] = [];
  for (const entry of await fs.scandir(path)) {
    if (entry.isFile() && hasSuffix(entry.name, suffix)) {
      const filePath = `${path}/${entry.name}`;
      files.push({
        name: entry.name,
        path: filePath,
        content: await fs.readFile(filePath),
      });
    }
  }
  return files;
}

// The first selected file, for pickers that only accept one.
export async function readFirstSelection(
  fs: Pick<FileSystem, "readFile" | "scandir">,
  ref: FileSelectionRef,
  suffix?: string | string[],
): Promise<PickedFile | undefined> {
  return (await readSelection(fs, ref, suffix))[0];
}
