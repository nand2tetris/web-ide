import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";

import {
  BUILTIN_CHIP_PROJECTS,
  CHIP_ORDER,
  CHIP_PROJECTS,
  ChipProjects,
} from "@nand2tetris/projects/index.js";
import {
  CompilationError,
  parse as parseChip,
} from "@nand2tetris/simulator/chip/builder.js";
import {
  getBuiltinChip,
  REGISTRY,
} from "@nand2tetris/simulator/chip/builtins/index.js";
import {
  Chip,
  Low,
  Pin,
  Chip as SimChip,
} from "@nand2tetris/simulator/chip/chip.js";
import { Clock } from "@nand2tetris/simulator/chip/clock.js";
import { Span } from "@nand2tetris/simulator/languages/base.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { ChipTest } from "@nand2tetris/simulator/test/chiptst.js";

import { ImmPin, reducePins } from "../pinout.js";
import { useImmerReducer } from "../react.js";

import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";
import { compare } from "../compare.js";
import { BaseContext } from "./base.context.js";

export const PROJECT_NAMES = [
  ["01", `Project 1`],
  ["02", `Project 2`],
  ["03", `Project 3`],
  ["05", `Project 5`],
];

function getChips(project: keyof typeof CHIP_PROJECTS) {
  return project in CHIP_ORDER
    ? (CHIP_ORDER as Record<typeof project, string[]>)[project]
    : BUILTIN_CHIP_PROJECTS[project].concat(CHIP_PROJECTS[project]);
}

function findDropdowns(storage: Record<string, string>) {
  const project =
    (storage["/chip/project"] as keyof typeof CHIP_PROJECTS) ?? "01";
  const chips = getChips(project);
  const chipName = storage["/chip/chip"] ?? CHIP_PROJECTS[project][0];
  return { project, chips, chipName };
}

function makeHdl(name: string) {
  return `CHIP ${name} {
  IN in;
  OUT out;
  PARTS:
}`;
}

function makeTst() {
  return `repeat 10 {
  tick,
  tock;
}`;
}

function makeCmp() {
  return `| in|out|`;
}

export function isBuiltinOnly(chipName: string) {
  return Object.values(BUILTIN_CHIP_PROJECTS).flat().includes(chipName);
}

function getTemplate(project: keyof typeof CHIP_PROJECTS, chipName: string) {
  if (isBuiltinOnly(chipName)) {
    return (ChipProjects[project].BUILTIN_CHIPS as Record<string, string>)[
      chipName
    ];
  }

  return (
    ChipProjects[project].CHIPS as Record<string, Record<string, string>>
  )[chipName][`${chipName}.hdl`] as string;
}

function getBuiltinCode(project: keyof typeof CHIP_PROJECTS, chipName: string) {
  const template = getTemplate(project, chipName);
  if (isBuiltinOnly(chipName)) {
    return template;
  }
  const bodyComment = "//// Replace this comment with your code.";
  const builtinLine = `BUILTIN ${chipName};`;
  const builtinCode = template.includes(bodyComment)
    ? template.replace(bodyComment, builtinLine)
    : template.replace("PARTS:", `PARTS:\n    ${builtinLine}`);
  return builtinCode;
}

export interface ChipPageState {
  files: Files;
  sim: ChipSim;
  controls: ControlsState;
}

export interface ChipSim {
  clocked: boolean;
  inPins: ImmPin[];
  outPins: ImmPin[];
  internalPins: ImmPin[];
  chip: [Chip];
  pending: boolean;
  invalid: boolean;
}

export interface Files {
  hdl: string;
  cmp: string;
  tst: string;
  out: string;
}

export interface ControlsState {
  project: keyof typeof CHIP_PROJECTS;
  chips: string[];
  chipName: string;
  hasBuiltin: boolean;
  builtinOnly: boolean;
  runningTest: boolean;
  span?: Span;
  error?: CompilationError;
}

export interface HDLFile {
  name: string;
  content: string;
}

function reduceChip(chip: SimChip, pending = false, invalid = false): ChipSim {
  return {
    clocked: chip.clocked,
    inPins: reducePins(chip.ins),
    outPins: reducePins(chip.outs),
    internalPins: reducePins(chip.pins),
    chip: [chip],
    pending,
    invalid,
  };
}

const clock = Clock.get();

export type ChipStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeChipStore>["reducers"];
  payload?: unknown;
}>;

export function makeChipStore(
  fs: FileSystem,
  setStatus: (status: string) => void,
  storage: Record<string, string>,
  dispatch: MutableRefObject<ChipStoreDispatch>
) {
  const dropdowns = findDropdowns(storage);
  let { project, chipName } = dropdowns;
  const { chips } = dropdowns;
  let chip = new Low();
  let test = new ChipTest();
  let usingBuiltin = false;
  let builtinOnly = false;
  let invalid = false;

  const reducers = {
    setFiles(
      state: ChipPageState,
      {
        hdl = state.files.hdl,
        tst = state.files.tst,
        cmp = state.files.cmp,
        out = "",
      }: {
        hdl?: string;
        tst?: string;
        cmp?: string;
        out?: string;
      }
    ) {
      state.files.hdl = hdl;
      state.files.tst = tst;
      state.files.cmp = cmp;
      state.files.out = out;
    },

    updateChip(
      state: ChipPageState,
      payload?: {
        pending?: boolean;
        invalid?: boolean;
        chipName?: string;
        error?: CompilationError | undefined;
      }
    ) {
      state.sim = reduceChip(
        chip,
        payload?.pending ?? state.sim.pending,
        payload?.invalid ?? state.sim.invalid
      );
      state.controls.error = state.sim.invalid
        ? payload?.error ?? state.controls.error
        : undefined;
    },

    setProject(state: ChipPageState, project: keyof typeof CHIP_PROJECTS) {
      const chips = getChips(project);
      const chipName =
        state.controls.chipName && chips.includes(state.controls.chipName)
          ? state.controls.chipName
          : chips[0];
      state.controls.project = project;
      state.controls.chips = chips;
      this.setChip(state, chipName);
    },

    setChip(state: ChipPageState, chipName: string) {
      state.controls.chipName = chipName;
      state.controls.hasBuiltin = REGISTRY.has(chipName);
      state.controls.builtinOnly = isBuiltinOnly(chipName);
    },

    testRunning(state: ChipPageState) {
      state.controls.runningTest = true;
    },

    testFinished(state: ChipPageState) {
      state.controls.runningTest = false;
      const passed = compare(state.files.cmp.trim(), state.files.out.trim());
      setStatus(
        passed
          ? `Simulation successful: The output file is identical to the compare file`
          : `Simulation error: The output file differs from the compare file`
      );
    },

    updateTestStep(state: ChipPageState) {
      state.files.out = test?.log() ?? "";
      if (test?.currentStep?.span) {
        state.controls.span = test.currentStep.span;
      } else {
        if (test.done) {
          const end = state.files.tst.length;
          state.controls.span = {
            start: end - 1,
            end,
            line: state.files.tst.split("\n").length,
          };
        }
      }
      this.updateChip(state, {
        pending: state.sim.pending,
        invalid: state.sim.invalid,
      });
    },
  };

  const actions = {
    setProject(p: keyof typeof CHIP_PROJECTS) {
      project = storage["/chip/project"] = p;
      dispatch.current({ action: "setProject", payload: project });
      this.setChip(CHIP_PROJECTS[project][0]);
    },

    async setChip(chip: string, project = storage["/chip/project"] ?? "01") {
      chipName = storage["/chip/chip"] = chip;
      dispatch.current({ action: "setChip", payload: chipName });
      builtinOnly = isBuiltinOnly(chipName);

      if (builtinOnly) {
        dispatch.current({
          action: "setFiles",
          payload: { hdl: "", tst: "", cmp: "" },
        });
        this.useBuiltin();
        return;
      }
      await this.loadChip(project, chipName);
      if (usingBuiltin) {
        this.useBuiltin();
      }
    },

    reset() {
      Clock.get().reset();
      chip.reset();
      test.reset();
      dispatch.current({ action: "setFiles", payload: {} });
      dispatch.current({ action: "updateChip" });
    },

    async updateFiles({
      hdl,
      tst,
      cmp,
    }: {
      hdl?: string;
      tst?: string;
      cmp: string;
    }) {
      invalid = false;
      dispatch.current({ action: "setFiles", payload: { hdl, tst, cmp } });
      try {
        if (hdl) {
          await this.compileChip(hdl);
        }
        if (tst) {
          this.compileTest(tst);
        }
      } catch (e) {
        setStatus(display(e));
      }
      dispatch.current({ action: "updateChip", payload: { invalid: invalid } });
      if (!invalid) {
        setStatus(`HDL code: No syntax errors`);
      }
    },

    async compileChip(hdl: string) {
      chip.remove();
      const maybeChip = await parseChip(hdl, chipName);
      if (isErr(maybeChip)) {
        const error = Err(maybeChip);
        setStatus(
          `${error.span?.line != undefined ? `Line ${error.span.line}: ` : ""}${
            Err(maybeChip).message
          }`
        );
        invalid = true;
        dispatch.current({
          action: "updateChip",
          payload: { invalid: true, error },
        });
        return;
      }
      this.replaceChip(Ok(maybeChip));
    },

    replaceChip(nextChip: SimChip) {
      // Store current inPins
      const inPins = chip.ins;
      for (const [pin, { busVoltage }] of inPins) {
        const nextPin = nextChip.ins.get(pin);
        if (nextPin) {
          nextPin.busVoltage = busVoltage;
        }
      }
      clock.reset();
      nextChip.eval();
      chip = nextChip;
      chip.reset();
      test = test.with(chip).reset();
      dispatch.current({ action: "updateChip", payload: { invalid: false } });
      dispatch.current({ action: "updateTestStep" });
    },

    async loadChip(project: string, name: string) {
      storage["/chip/chip"] = name;
      const fsName = (ext: string) =>
        `/projects/${project}/${name}/${name}.${ext}`;

      const [hdl, tst, cmp] = await Promise.all([
        fs.readFile(fsName("hdl")).catch(() => makeHdl(name)),
        fs.readFile(fsName("tst")).catch((e) => {
          return makeTst();
        }),
        fs.readFile(fsName("cmp")).catch(() => makeCmp()),
      ]);

      dispatch.current({ action: "setFiles", payload: { hdl, tst, cmp } });
      await this.compileChip(hdl);
      this.compileTest(tst);
    },

    async saveChip(hdl: string, prj = project, name = chipName) {
      dispatch.current({ action: "setFiles", payload: { hdl } });
      const path = `/projects/${prj}/${name}/${name}.hdl`;
      await fs.writeFile(path, hdl);
      setStatus(`Saved ${path}`);
    },

    toggle(pin: Pin, i: number | undefined) {
      if (i !== undefined) {
        pin.busVoltage = pin.busVoltage ^ (1 << i);
      } else {
        if (pin.width === 1) {
          pin.toggle();
        } else {
          pin.busVoltage += 1;
        }
      }
      dispatch.current({ action: "updateChip", payload: { pending: true } });
    },

    eval() {
      chip.eval();
      dispatch.current({ action: "updateChip", payload: { pending: false } });
    },

    clock() {
      clock.toggle();
      if (clock.isLow) {
        clock.frame();
      }
      dispatch.current({ action: "updateChip" });
    },

    async useBuiltin(doUseBuiltin = true, oldHdl?: string) {
      if (!doUseBuiltin) {
        if (!builtinOnly) {
          usingBuiltin = false;
        }
        await this.loadChip(project, chipName);
        return;
      }
      if (!builtinOnly) {
        usingBuiltin = true;
      }
      const builtinName = chipName;
      const nextChip = getBuiltinChip(builtinName);
      if (isErr(nextChip)) {
        setStatus(
          `Failed to load builtin ${builtinName}: ${display(Err(nextChip))}`
        );
        return;
      }

      // Save hdl code that will be overwritten by the switch
      if (oldHdl) {
        await this.saveChip(oldHdl, project, chipName);
      }

      const hdl = getBuiltinCode(project, builtinName);
      dispatch.current({ action: "setFiles", payload: { hdl } });
      this.replaceChip(Ok(nextChip));
    },

    async initialize() {
      await this.setChip(chipName, project);
    },

    compileTest(file: string) {
      dispatch.current({ action: "setFiles", payload: { tst: file } });
      const tst = TST.parse(file);

      if (isErr(tst)) {
        setStatus(`Failed to parse test ${Err(tst).message}`);
        invalid = true;
        return false;
      }

      test = ChipTest.from(Ok(tst)).with(chip).reset();
      test.setFileSystem(fs);
      dispatch.current({ action: "updateTestStep" });
      return true;
    },

    async runTest(file: string) {
      if (!this.compileTest(file)) {
        return;
      }
      dispatch.current({ action: "testRunning" });

      fs.pushd("/samples");
      await test.run();
      fs.popd();

      dispatch.current({ action: "updateTestStep" });
      dispatch.current({ action: "testFinished" });
    },

    tick(): boolean {
      return this.stepTest();
    },

    stepTest(): boolean {
      assert(test.chipId === chip.id, "Test and chip out of sync");
      const done = test.step();
      dispatch.current({ action: "updateTestStep" });
      if (done) {
        dispatch.current({ action: "testFinished" });
      }
      return done;
    },

    resetFile() {
      const template = (
        ChipProjects[project].CHIPS as Record<string, Record<string, string>>
      )[chipName][`${chipName}.hdl`];
      dispatch.current({ action: "setFiles", payload: { hdl: template } });
    },

    async getProjectFiles() {
      return await Promise.all(
        CHIP_PROJECTS[project].map((chip) => ({
          name: `${chip}.hdl`,
          content: fs.readFile(`/projects/${project}/${chip}/${chip}.hdl`),
        }))
      );
    },
  };

  const initialState: ChipPageState = (() => {
    const controls: ControlsState = {
      project,
      chips,
      chipName,
      hasBuiltin: REGISTRY.has(chipName),
      builtinOnly: isBuiltinOnly(chipName),
      runningTest: false,
      error: undefined,
    };

    const maybeChip = getBuiltinChip(controls.chipName);
    if (isErr(maybeChip)) {
      setStatus(display(Err(maybeChip)));
      chip = new Low();
    } else {
      chip = Ok(maybeChip);
    }

    const sim = reduceChip(chip);

    return {
      controls,
      files: {
        hdl: "",
        cmp: "",
        tst: "",
        out: "",
      },
      sim,
    };
  })();

  return { initialState, reducers, actions };
}

export function useChipPageStore() {
  const { fs, setStatus, storage } = useContext(BaseContext);

  const dispatch = useRef<ChipStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeChipStore(fs, setStatus, storage, dispatch),
    [fs, setStatus, storage, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
