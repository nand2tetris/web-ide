import { FileSystemAdapter, Stats } from "@davidsouther/jiffies/lib/esm/fs.js";
import { copyFile, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import { basename } from "path";

export class NodeFileSystemAdapter implements FileSystemAdapter {
  async stat(path: string): Promise<Stats> {
    const fsStat = await stat(path);
    return {
      name: basename(path),
      isDirectory() {
        return fsStat.isDirectory();
      },
      isFile() {
        return !fsStat.isDirectory();
      },
    };
  }

  async readdir(path: string): Promise<string[]> {
    return readdir(path);
  }

  async scandir(path: string): Promise<Stats[]> {
    return Promise.all(
      (await this.readdir(path)).map(
        async (name) => await this.stat(path + "/" + name)
      )
    );
  }
  async copyFile(from: string, to: string): Promise<void> {
    return copyFile(from, to);
  }
  async readFile(path: string): Promise<string> {
    return readFile(path, "utf-8");
  }
  async writeFile(path: string, contents: string): Promise<void> {
    return writeFile(path, contents, "utf-8");
  }
  async rm(path: string): Promise<void> {
    return rm(path);
  }
}

export function splitFile(file: string) {
  const { name, ext } = file.match(/(.*\/)?(?<name>[^/]+)\.(?<ext>[^./]+)$/)
    ?.groups as { name: string; ext: string };
  return { name, ext };
}
