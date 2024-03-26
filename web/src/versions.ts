import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { Projects, resetFiles, resetTests } from "@nand2tetris/projects/index";

const VERSION_KEY = "version";
const CURRENT_VERSION = 7;

export function getVersion() {
  return Number(localStorage.getItem(VERSION_KEY) ?? "0");
}

export function setVersion(version: number) {
  localStorage.setItem(VERSION_KEY, version.toString());
}

let lock = false;

export async function updateVersion(fs: FileSystem) {
  // React will double-render a call to updateVersion in useEffect.
  if (lock) {
    return;
  }
  lock = true;
  let version = getVersion();

  while (version < CURRENT_VERSION) {
    try {
      await versionUpdates[version](fs);
      version++;
    } catch (e) {
      console.warn(`Error loading files at version ${version}`, e);
      version++;
    }
  }

  setVersion(CURRENT_VERSION);
  lock = false;
}

const versionUpdates: Record<number, (fs: FileSystem) => Promise<void>> = {
  0: async (fs: FileSystem) => {
    for (const suffix of ["hdl", "cmp", "tst"]) {
      await fs.writeFile(
        `/projects/01/Xor/Xor.${suffix}`,
        await fs.readFile(`/projects/01/XOr/XOr.${suffix}`)
      );
    }
  },
  1: async (fs: FileSystem) => {
    await resetFiles(fs, ["4"]);
  },
  2: async (fs: FileSystem) => {
    await resetTests(fs, ["1"]);
  },
  3: async (fs: FileSystem) => {
    await resetTests(fs);
  },
  4: async (fs: FileSystem) => {
    await resetFiles(fs, ["7", "8"]);
  },
  5: async (fs: FileSystem) => {
    await resetTests(fs, ["3", "5"]);
  },
  6: async (fs: FileSystem) => {
    const project = localStorage.getItem("/chip/project");
    if (project?.match(/0\d+/)) {
      localStorage.setItem("/chip/project", project.slice(1));
    }
    const oldProjects = new Set(
      (await fs.scandir("/projects"))
        .filter((entry) => entry.name.startsWith("0") && entry.isDirectory())
        .map((entry) => entry.name)
    );
    for (const project of Object.keys(Projects)) {
      if (oldProjects.has(`0${project}`)) {
        await copyTree(fs, `/projects/0${project}`, `/projects/${project}`);
      }
    }
  },
};

async function copyTree(fs: FileSystem, from: string, to: string) {
  console.log("scanning", from);
  for (const entry of await fs.scandir(from)) {
    console.log("entry", entry.name);
    if (entry.name.includes(".")) {
      // file
      console.log(
        "copying",
        `${from}/${entry.name}`,
        "to",
        `${to}/${entry.name}`
      );
      await fs.copyFile(`${from}/${entry.name}`, `${to}/${entry.name}`);
    } else {
      // directory
      await fs.mkdir(`${to}/${entry.name}`);
      await copyTree(fs, `${from}/${entry.name}`, `${to}/${entry.name}`);
    }
  }
}
