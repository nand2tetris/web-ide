import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { Cmp, CMP } from "../../languages/cmp.js";
import { HDL, HdlParse } from "../../languages/hdl.js";
import { Tst, TST } from "../../languages/tst.js";
import { ChipProjects, CHIP_PROJECTS } from "@nand2tetris/projects/index.js";
import { Max } from "@nand2tetris/projects/samples/hack.js";
import { compare } from "../../compare.js";
import { build } from "../builder.js";
import { Chip } from "../chip.js";
import { ChipTest } from "../../test/chiptst.js";

const SKIP = new Set<string>(["Computer"]);

describe("All Projects", () => {
  describe.each(Object.keys(CHIP_PROJECTS))("project %s", (project) => {
    it.each(
      CHIP_PROJECTS[project as keyof typeof CHIP_PROJECTS].filter(
        (k) => !SKIP.has(k)
      )
    )("Builtin %s", async (chipName) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const ChipProject = ChipProjects[project]?.CHIPS[chipName];
      let hdlFile: string = ChipProject?.[`${chipName}.hdl`];
      const tstFile: string = ChipProject?.[`${chipName}.tst`];
      const cmpFile: string = ChipProject?.[`${chipName}.cmp`];

      expect(hdlFile).toBeDefined();
      expect(tstFile).toBeDefined();
      expect(cmpFile).toBeDefined();

      const partsIdx = hdlFile.indexOf("PARTS:");
      expect(partsIdx).toBeGreaterThan(0);
      hdlFile = hdlFile.substring(0, partsIdx) + "BUILTIN; }";
      const hdl = HDL.parse(hdlFile);
      expect(hdl).toBeOk();
      const tst = TST.parse(tstFile);
      expect(tst).toBeOk();

      const chip = await build(Ok(hdl as Ok<HdlParse>));
      expect(chip).toBeOk();
      const test = ChipTest.from(Ok(tst as Ok<Tst>)).with(Ok(chip as Ok<Chip>));

      if (project === "05") {
        test.setFileSystem(
          new FileSystem(
            new ObjectFileSystemAdapter({ "/samples/Max.hack": Max })
          )
        );
      }

      await test.run();

      const outFile = test.log();

      const cmp = CMP.parse(cmpFile);
      expect(cmp).toBeOk();
      const out = CMP.parse(outFile);
      expect(out).toBeOk();

      const diffs = compare(Ok(cmp as Ok<Cmp>), Ok(out as Ok<Cmp>));
      expect(diffs).toHaveNoDiff();
    });
  });
});
