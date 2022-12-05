import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { build } from "../chip/builder.js";
import { Chip } from "../chip/chip.js";
import { compare } from "../compare.js";
import { Asm, ASM } from "../languages/asm.js";
import { Cmp, CMP } from "../languages/cmp.js";
import { HDL, HdlParse } from "../languages/hdl.js";
import { Tst, TST } from "../languages/tst.js";
import { ChipTest } from "../tst.js";
import {
  ChipProjects,
  ASM_PROJECTS,
  CHIP_PROJECTS,
} from "@nand2tetris/projects/index.js";
import { ChipProjects as ChipProjectsSols } from "@nand2tetris/projects/solutions/index.js";
import {
  ASM_SOLS,
  FILES as ASM_FILES,
} from "@nand2tetris/projects/samples/project_06/index.js";
import { Max } from "@nand2tetris/projects/samples/hack.js";

const SKIP = new Set<string>([]);

describe("Chip Projects", () => {
  describe.each(Object.keys(CHIP_PROJECTS))("project %s", (project) => {
    it.each(
      CHIP_PROJECTS[project as keyof typeof CHIP_PROJECTS].filter(
        (k) => !SKIP.has(k)
      )
    )("Chip %s", async (chipName) => {
      const chipProject = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...ChipProjects[project]!,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ...ChipProjectsSols[project]!,
      };
      const hdlFile = chipProject.SOLS[chipName]?.[`${chipName}.hdl`];
      const tstFile = chipProject.CHIPS[chipName]?.[`${chipName}.tst`];
      const cmpFile = chipProject.CHIPS[chipName]?.[`${chipName}.cmp`];

      expect(hdlFile).toBeDefined();
      expect(tstFile).toBeDefined();
      expect(cmpFile).toBeDefined();

      const hdl = HDL.parse(hdlFile);
      expect(hdl).toBeOk();
      const tst = TST.parse(tstFile);
      expect(tst).toBeOk();

      const chip = await build(Ok(hdl as Ok<HdlParse>));
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
      expect(filled).toEqual(ASM_SOLS[file_name as keyof typeof ASM_FILES]);
    });
  });
});
