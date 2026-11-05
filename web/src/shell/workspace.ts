import type { FileSystem } from "@davidsouther/jiffies/fs.ts";
import type { ReadonlyVfs } from "@ohm-js/language";

type Listener = () => void;

// Model URIs omit the project root: file:///1/And.hdl also identifies /projects/1/And.hdl.
const uriOfPath = (path: string) =>
  new URL(`file:///${path.replace(/^\/+/, "")}`).href;

export const folderOf = (uri: string) => uri.slice(0, uri.lastIndexOf("/"));

let currentFs: FileSystem | undefined;
const fsListeners = new Set<Listener>();

export function setWorkspaceFileSystem(fs: FileSystem) {
  if (currentFs === fs) return;
  currentFs = fs;
  for (const listener of fsListeners) listener();
}

export function onWorkspaceFileSystem(listener: Listener) {
  fsListeners.add(listener);
  return () => void fsListeners.delete(listener);
}

/** /projects takes precedence when both layouts expose the same model URI. */
const ROOTS = ["/projects", ""] as const;

const scandir = async (path: string) => {
  try {
    return (await currentFs?.scandir(path || "/")) ?? [];
  } catch {
    return [];
  }
};

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
          // Try the other project layout.
        }
      }
      return undefined;
    },
  };
}

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

// Page routes keep the file identity, editor value and simulator state together.
type Selection =
  | import("monaco-editor").IRange
  | import("monaco-editor").IPosition;
type OpenDocument = (uri: string) => boolean | Promise<boolean>;
const navigation = new Map<string, OpenDocument>();
const selections = new Map<string, Selection>();

export function registerWorkspaceNavigation(
  language: string,
  open: OpenDocument,
) {
  navigation.set(language, open);
  return () => {
    if (navigation.get(language) === open) navigation.delete(language);
  };
}

export async function openWorkspaceDocument(
  uri: string,
  selection?: Selection,
) {
  const language = uri.endsWith(".hdl") ? "hdl" : "jack";
  const open = navigation.get(language);
  if (!open) return false;
  if (selection) selections.set(uri, selection);
  const opened = await open(uri);
  if (!opened) selections.delete(uri);
  return opened;
}

export function takeWorkspaceSelection(uri: string) {
  const selection = selections.get(uri);
  selections.delete(uri);
  return selection;
}

export async function workspacePath(uri: string) {
  const path = decodeURIComponent(new URL(uri).pathname);
  for (const root of ROOTS) {
    try {
      if ((await currentFs?.readFile(`${root}${path}`)) !== undefined)
        return `${root}${path}`;
    } catch {
      /* Try the other project layout. */
    }
  }
  return undefined;
}
