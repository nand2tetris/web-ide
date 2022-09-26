import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs";
import { Ok } from "@davidsouther/jiffies/lib/esm/result";
import { CHIP_PROJECTS, ChipProjects, ASM_PROJECTS } from ".";
import { Asm, ASM } from "../languages/asm";
import { Cmp, CMP } from "../languages/cmp";
import { HDL, HdlParse } from "../languages/hdl";
import { Tst, TST } from "../languages/tst";
import { build } from "../simulator/chip/builder";
import { Chip } from "../simulator/chip/chip";
import { compare } from "../simulator/compare";
import { ChipTest } from "../simulator/tst";
import { ASM_SOLS, FILES as ASM_FILES } from "./project_06";
import { Max } from "./samples/hack";

const SKIP = new Set<string>([]);

describe("Chip Projects", () => {
  describe.each(Object.keys(CHIP_PROJECTS))("project %s", (project) => {
    it.each(
      CHIP_PROJECTS[project as keyof typeof CHIP_PROJECTS].filter(
        (k) => !SKIP.has(k)
      )
    )("Chip %s", async (chipName) => {
      // @ts-ignore
      const chipproject = ChipProjects[project]!;
      const hdlFile = chipproject.SOLS[chipName]?.[`${chipName}.hdl`];
      const tstFile = chipproject.CHIPS[chipName]?.[`${chipName}.tst`];
      const cmpFile = chipproject.CHIPS[chipName]?.[`${chipName}.cmp`];

      expect(hdlFile).toBeDefined();
      expect(tstFile).toBeDefined();
      expect(cmpFile).toBeDefined();

      const hdl = HDL.parse(hdlFile);
      expect(hdl).toBeOk();
      const tst = TST.parse(tstFile);
      expect(tst).toBeOk();

      const chip = build(Ok(hdl as Ok<HdlParse>));
      expect(chip).toBeOk();
      const test = ChipTest.from(Ok(tst as Ok<Tst>)).with(Ok(chip as Ok<Chip>));

      if (chipName === "Computer") {
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

describe("ASM Projects", () => {
  describe.each(Object.keys(ASM_PROJECTS))("project %s", (project) => {
    it.each(Object.keys(ASM_FILES))("%s", (file_name) => {
      const source = ASM_FILES[file_name as keyof typeof ASM_FILES];
      const parsed = ASM.parse(source);
      expect(parsed).toBeOk();
      const asm = Ok(parsed as Ok<Asm>);
      ASM.passes.fillLabel(asm);
      const filled = ASM.passes.emit(asm);
      console.log(filled);
      expect(filled).toEqual(ASM_SOLS[file_name as keyof typeof ASM_FILES]);
    });
  });
});
