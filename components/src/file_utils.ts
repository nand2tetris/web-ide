import { FileSystem, Stats } from "@davidsouther/jiffies/lib/esm/fs";
import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result.js";

interface TestFiles {
  tst: string;
  cmp?: string;
}

export async function loadTestFiles(
  fs: FileSystem,
  tstPath: string,
): Promise<Result<TestFiles>> {
  try {
    const tst = await fs.readFile(tstPath);
    let cmp: string | undefined = undefined;
    try {
      const cpmPath = tstPath
        .replace("VME.tst", ".tst")
        .replace(".tst", ".cmp");
      cmp = await fs.readFile(cpmPath);
    } catch (e) {
      // There doesn't have to be a compare file
    }
    return Ok({ tst: tst, cmp: cmp });
  } catch (e) {
    return Err(e as Error);
  }
}

export function sortFiles(files: Stats[]) {
  return files.sort((a, b) => {
    const aIsNum = /^\d+/.test(a.name);
    const bIsNum = /^\d+/.test(b.name);
    if (aIsNum && !bIsNum) {
      return -1;
    } else if (!aIsNum && bIsNum) {
      return 1;
    } else if (aIsNum && bIsNum) {
      return parseInt(a.name, 10) - parseInt(b.name, 10);
    } else {
      return a.name.localeCompare(b.name);
    }
  });
}
