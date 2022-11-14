import { FileSystemAdapter, Stats } from "@davidsouther/jiffies/lib/esm/fs.js";
import { copyFile, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import { basename, join } from "path";

/** Jiffies FileSystemAdapter using NodeJS' fs/promises. */
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
  readdir(path: string): Promise<string[]> {
    return readdir(path);
  }
  async scandir(path: string): Promise<Stats[]> {
    return Promise.all(
      (await this.readdir(path)).map((name) => this.stat(join(path, name)))
    );
  }
  copyFile(from: string, to: string): Promise<void> {
    return copyFile(from, to);
  }
  readFile(path: string): Promise<string> {
    return readFile(path, "utf-8");
  }
  writeFile(path: string, contents: string): Promise<void> {
    return writeFile(path, contents, "utf-8");
  }
  rm(path: string): Promise<void> {
    return rm(path);
  }
}
