import {
  FileSystem,
  FileSystemAdapter,
  Stats,
  basename,
} from "@davidsouther/jiffies/lib/esm/fs";
import { copyFile, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import { Assignments } from "@computron5k/simulator/projects/index.js";
import { hasTest, runTests } from "@computron5k/simulator/projects/runner.js";

class NodeFileSystemAdapter implements FileSystemAdapter {
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

function splitFile(file: string) {
  const { name, ext } = file.match(/(.*\/)?(?<name>[^/]+)\.(?<ext>[^./]+)$/)
    ?.groups as { name: string; ext: string };
  return { name, ext };
}

async function loadAssignment(pfile: Promise<{ name: string; hdl: string }>) {
  const file = await pfile;
  const assignment = Assignments[file.name as keyof typeof Assignments];
  const tst = assignment[
    `${file.name}.tst` as keyof typeof assignment
  ] as string;
  const cmp = assignment[
    `${file.name}.cmp` as keyof typeof assignment
  ] as string;
  return { ...file, tst, cmp };
}

async function main(root = process.cwd()) {
  const fs = new FileSystem(new NodeFileSystemAdapter());
  fs.cd(root);

  const files = [...(await fs.readdir("."))]
    .filter((file) => file.endsWith(".hdl"))
    .map((file) => ({ file, ...splitFile(file) }))
    .filter(hasTest)
    .map(async (file) => {
      const hdl = await fs.readFile(file.file);
      return { ...file, hdl };
    });

  const tests = await Promise.all(runTests(files, loadAssignment, fs));
  for (const test of tests) {
    console.log(`Test ${test.name}: ${test.pass ? "Passed" : "Failed"}`);
  }
}

main(process.argv[2]);
