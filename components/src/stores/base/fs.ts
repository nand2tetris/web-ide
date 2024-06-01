import {
  basename,
  FileSystemAdapter,
  SEP,
  Stats,
} from "@davidsouther/jiffies/lib/esm/fs.js";

function dirname(path: string): string {
  return path.split(SEP).slice(0, -1).join(SEP);
}

export function openNand2TetrisDirectory(): Promise<FileSystemDirectoryHandle> {
  return window.showDirectoryPicker({
    id: "nand2tetris",
    mode: "readwrite",
    startIn: "documents",
  });
}

export class FileSystemAccessFileSystemAdapter implements FileSystemAdapter {
  constructor(private baseDir: FileSystemDirectoryHandle) {}

  async getFolder(
    path: string,
    create = false
  ): Promise<FileSystemDirectoryHandle> {
    let folder = this.baseDir;
    const parts = path
      .split(SEP)
      .slice(1)
      .filter((part) => part.trim() != "");
    for (const part of parts) {
      folder = await folder.getDirectoryHandle(part, { create });
    }
    return folder;
  }

  async copyFile(from: string, to: string): Promise<void> {
    throw new Error(
      "unimplemented: FileSystemAccessFileSystemAdapter::copyFile"
    );
  }

  async mkdir(path: string): Promise<void> {
    this.getFolder(path, true);
  }

  async readFile(path: string): Promise<string> {
    const folder = await this.getFolder(dirname(path));
    const file = await (await folder.getFileHandle(basename(path))).getFile();
    return file.text();
  }

  async writeFile(path: string, contents: string): Promise<void> {
    const folder = await this.getFolder(dirname(path), true);
    const file = await (
      await folder.getFileHandle(basename(path), { create: true })
    ).createWritable();
    await file.write(contents);
    await file.close();
  }

  async readdir(path: string): Promise<string[]> {
    const folder = await this.getFolder(path);
    const entries: string[] = [];
    for await (const [entry, _] of folder.entries()) {
      entries.push(entry);
    }
    return entries;
  }

  async scandir(path: string): Promise<Stats[]> {
    const folder = await this.getFolder(path);
    const entries: Stats[] = [];
    for await (const [name, handle] of folder.entries()) {
      entries.push({
        name,
        isDirectory() {
          return handle.kind == "directory";
        },
        isFile() {
          return handle.kind == "file";
        },
      });
    }
    return entries;
  }

  async stat(path: string): Promise<Stats> {
    const folder = await this.getFolder(dirname(path));
    for await (const [name, handle] of folder.entries()) {
      if (name == basename(path)) {
        return {
          name,
          isDirectory() {
            return handle.kind == "directory";
          },
          isFile() {
            return handle.kind == "file";
          },
        };
      }
    }
    return {
      name: basename(path),
      isDirectory() {
        return false;
      },
      isFile() {
        return false;
      },
    };
  }

  async rm(path: string): Promise<void> {
    const folder = await this.getFolder(dirname(path), true);
    await folder.removeEntry(basename(path), { recursive: true });
  }
}

export class ChainedFileSystemAdapter implements FileSystemAdapter {
  constructor(
    protected adapter: FileSystemAdapter,
    private nextAdapter?: FileSystemAdapter | undefined
  ) {}

  stat(path: string): Promise<Stats> {
    return this.adapter.stat(path).catch((e) => {
      if (this.nextAdapter) {
        return this.nextAdapter.stat(path);
      }
      throw e;
    });
  }
  readdir(path: string): Promise<string[]> {
    return this.adapter.readdir(path).catch((e) => {
      if (this.nextAdapter) {
        return this.nextAdapter.readdir(path);
      }
      throw e;
    });
  }
  scandir(path: string): Promise<Stats[]> {
    return this.adapter.scandir(path).catch((e) => {
      if (this.nextAdapter) {
        return this.nextAdapter.scandir(path);
      }
      throw e;
    });
  }

  async mkdir(path: string): Promise<void> {
    if (this.nextAdapter) await this.nextAdapter.mkdir(path);
    return this.adapter.mkdir(path);
  }
  async copyFile(from: string, to: string): Promise<void> {
    if (this.nextAdapter) await this.nextAdapter.copyFile(from, to);
    return this.adapter.copyFile(from, to);
  }
  readFile(path: string): Promise<string> {
    return this.adapter.readFile(path).catch((e) => {
      if (this.nextAdapter) {
        return this.nextAdapter.readFile(path);
      }
      throw e;
    });
  }
  async writeFile(path: string, contents: string): Promise<void> {
    if (this.nextAdapter) await this.nextAdapter?.writeFile(path, contents);
    return this.adapter.writeFile(path, contents);
  }
  async rm(path: string): Promise<void> {
    if (this.nextAdapter) await this.nextAdapter.rm(path);
    return this.adapter.rm(path);
  }
}
