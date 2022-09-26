import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { Ok } from "@davidsouther/jiffies/lib/esm/result";
import { Cmp, CMP } from "../../../languages/cmp";
import { HDL, HdlParse } from "../../../languages/hdl";
import { Tst, TST } from "../../../languages/tst";
import { CHIP_PROJECTS, ChipProjects } from "../../../projects";
import { Max } from "../../../projects/samples/hack";
import { compare } from "../../compare";
import { ChipTest } from "../../tst";
import { build } from "../builder";
import { Chip } from "../chip";

const SKIP = new Set<string>(["Computer"]);

describe("All Projects", () => {
  describe.each(Object.keys(CHIP_PROJECTS))("project %s", (project) => {
    it.each(
      CHIP_PROJECTS[project as keyof typeof CHIP_PROJECTS].filter(
        (k) => !SKIP.has(k)
      )
    )("Builtin %s", async (chipName) => {
      let hdlFile: string =
        // @ts-ignore
        ChipProjects[project]?.SOLS[chipName]?.[`${chipName}.hdl`];
      const tstFile: string =
        // @ts-ignore
        ChipProjects[project]?.CHIPS[chipName]?.[`${chipName}.tst`];
      const cmpFile: string =
        // @ts-ignore
        ChipProjects[project]?.CHIPS[chipName]?.[`${chipName}.cmp`];

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

      const chip = build(Ok(hdl as Ok<HdlParse>));
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
