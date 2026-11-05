// The files that language services see beyond the open editors: HDL chips of
// the project folders in the app's file system, and the Jack classes that the
// compiler page holds in memory. URIs are the ones Monaco gives its models, so
// `file:///1/And.hdl` is both the editor for `1/And.hdl` and the file
// `/projects/1/And.hdl`.
import type { FileSystem } from "@davidsouther/jiffies/fs.ts";
import type { ReadonlyVfs } from "@ohm-js/language";

type Listener = () => void;

const uriOfPath = (path: string) =>
  new URL(`file:///${path.replace(/^\/+/, "")}`).href;

/** The folder of a file URI: the group within which names are shared. */
export const folderOf = (uri: string) => uri.slice(0, uri.lastIndexOf("/"));

let currentFs: FileSystem | undefined;
const fsListeners = new Set<Listener>();

/** Tells the language services which file system the app uses now. */
export function setWorkspaceFileSystem(fs: FileSystem) {
  if (currentFs === fs) return;
  currentFs = fs;
  for (const listener of fsListeners) listener();
}

export function onWorkspaceFileSystem(listener: Listener) {
  fsListeners.add(listener);
  return () => void fsListeners.delete(listener);
}

/** The roots that hold project folders: the course layout, then the upgraded one. */
const ROOTS = ["/projects", ""] as const;

const scandir = async (path: string) => {
  try {
    return (await currentFs?.scandir(path || "/")) ?? [];
  } catch {
    return [];
  }
};

/**
 * Files with `extension` one folder below a project root, streamed folder by
 * folder, and read from the app's file system on demand.
 */
export function projectVfs(extension: string): ReadonlyVfs {
  return {
    async *list() {
      const seen = new Set<string>();
      for (const root of ROOTS) {
        for (const folder of await scandir(root)) {
          if (
            !folder.isDirectory() ||
            (root === "" && folder.name === "projects")
          ) {
            continue;
          }
          for (const item of await scandir(`${root}/${folder.name}`)) {
            const uri = uriOfPath(`${folder.name}/${item.name}`);
            if (
              item.isFile() &&
              item.name.endsWith(extension) &&
              !seen.has(uri)
            ) {
              seen.add(uri);
              yield uri;
            }
          }
        }
      }
    },
    async read(uri) {
      const path = decodeURIComponent(new URL(uri).pathname);
      for (const root of ROOTS) {
        try {
          return await currentFs?.readFile(`${root}${path}`);
        } catch {
          // Not under this root.
        }
      }
      return undefined;
    },
  };
}

/** Files that a page holds in memory, replaced wholesale when the page changes them. */
export function recordVfs() {
  let files = new Map<string, string>();
  const listeners = new Set<Listener>();
  const vfs: ReadonlyVfs = {
    async *list() {
      yield* [...files.keys()];
    },
    read: async (uri) => files.get(uri),
  };
  return {
    vfs,
    set(next: Record<string, string>) {
      files = new Map(
        Object.entries(next).map(([path, text]) => [uriOfPath(path), text]),
      );
      for (const listener of listeners) listener();
    },
    onChange(listener: Listener) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

export const jackFiles = recordVfs();
