import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { Err, Ok, Result } from "@davidsouther/jiffies/lib/esm/result.js";

interface TestFiles {
  tst: string;
  cmp?: string;
}

export async function loadTestFiles(
  fs: FileSystem,
  tstPath: string
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
