import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { Ok, unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { build } from "../chip/builder.js";
import { Chip } from "../chip/chip.js";
import { compare } from "../compare.js";
import { Asm, ASM } from "../languages/asm.js";
import { Cmp, CMP } from "../languages/cmp.js";
import { HDL, HdlParse } from "../languages/hdl.js";
import { Tst, TST } from "../languages/tst.js";
import {
  ChipProjects,
  VmProjects,
  ASM_PROJECTS,
  CHIP_PROJECTS,
  VM_PROJECTS,
} from "@nand2tetris/projects/index.js";
import { ChipProjects as ChipProjectsSols } from "@nand2tetris/projects/testing/index.js";
import {
  ASM_SOLS,
  FILES as ASM_FILES,
} from "@nand2tetris/projects/samples/project_06/index.js";
import { Max } from "@nand2tetris/projects/samples/hack.js";
import { ChipTest } from "../test/chiptst.js";
import { VM } from "../languages/vm.js";
import { Vm } from "../vm/vm.js";
import { VMTest } from "../test/vmtst.js";

const PROJECTS = new Set<string>(["01", "03", "07", "08"]);
const SKIP = new Set<string>([]);
const INCLUDE = new Set<string>(["And", "And16", "Mux8Way16", "Bit"]);

describe("Chip Projects", () => {
  describe.each(Object.keys(CHIP_PROJECTS).filter((k) => PROJECTS.has(k)))(
    "project %s",
    (project) => {
      it.each(
        CHIP_PROJECTS[project as keyof typeof CHIP_PROJECTS]
          .filter((k) => !SKIP.has(k))
          .filter((k) => INCLUDE.has(k))
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
        const test = ChipTest.from(Ok(tst as Ok<Tst>)).with(
          Ok(chip as Ok<Chip>)
        );

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
    }
  );
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

describe("Vm Projects", () => {
  describe.each(Object.keys(VM_PROJECTS).filter((k) => PROJECTS.has(k)))(
    "project %s",
    (project) => {
      it.each(
        VM_PROJECTS[project as keyof typeof VM_PROJECTS].filter(
          (k) => !SKIP.has(k)
        )
      )("VM Program %s", async (vmName) => {
        const vmProject = {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ...VmProjects[project]!,
        };
        const vmFile = vmProject.VMS[vmName]?.[`${vmName}.vm`];
        const tstFile = vmProject.VMS[vmName]?.[`${vmName}VME.tst`];
        const cmpFile = vmProject.VMS[vmName]?.[`${vmName}.cmp`];

        expect(vmFile).toBeDefined();
        expect(tstFile).toBeDefined();
        expect(cmpFile).toBeDefined();

        const parsed = VM.parse(vmFile);
        expect(parsed).toBeOk();
        const tst = TST.parse(tstFile);
        expect(tst).toBeOk();

        const vm = await Vm.build(unwrap(parsed).instructions);
        expect(vm).toBeOk();
        const test = VMTest.from(unwrap(tst)).with(unwrap(vm));

        await test.run();

        const outFile = test.log();

        const cmp = CMP.parse(cmpFile);
        expect(cmp).toBeOk();
        const out = CMP.parse(outFile);
        expect(out).toBeOk();

        const diffs = compare(unwrap(cmp), unwrap(out));
        expect(diffs).toHaveNoDiff();
      });
    }
  );
});
