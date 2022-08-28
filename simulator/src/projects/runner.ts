import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { isOk, Ok, Err, isErr } from "@davidsouther/jiffies/lib/esm/result";
import { HDL } from "../languages/hdl";
import { TST } from "../languages/tst";
import { build as buildChip } from "../chip/builder";
import { ChipTest } from "../tst";

export function runTests(
  files: Array<Promise<{ name: string; hdl: string }>>,
  loadAssignment: (
    pfile: Promise<{ name: string; hdl: string }>
  ) => Promise<{ name: string; hdl: string; tst: string; cmp: string }>,
  fs: FileSystem
) {
  return files
    .map(loadAssignment)
    .map(async (pfile) => {
      const file = await pfile;
      const maybeParsedHDL = HDL.parse(file.hdl);
      const maybeParsedTST = TST.parse(file.tst);
      return { ...file, maybeParsedHDL, maybeParsedTST };
    })
    .map(async (pfile) => {
      const file = await pfile;
      const maybeChip = isOk(file.maybeParsedHDL)
        ? buildChip(Ok(file.maybeParsedHDL))
        : Err(new Error("HDL Was not parsed"));
      const maybeTest = isOk(file.maybeParsedTST)
        ? Ok(ChipTest.from(Ok(file.maybeParsedTST)))
        : Err(new Error("TST Was not parsed"));
      return { ...file, maybeChip, maybeTest };
    })
    .map(async (pfile) => {
      const file = await pfile;
      if (isErr(file.maybeChip)) {
        return { ...file, pass: false, out: Err(file.maybeChip).message };
      }
      if (isErr(file.maybeTest)) {
        return { ...file, pass: false, out: Err(file.maybeTest).message };
      }
      const test = Ok(file.maybeTest)
        .with(Ok(file.maybeChip))
        .setFileSystem(fs);
      await test.run();
      const out = test.log();
      const pass = out.trim() === file.cmp.trim();
      return { ...file, out, pass };
    });
}
