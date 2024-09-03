import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";

import {
  BUILTIN_CHIP_PROJECTS,
  CHIP_ORDER,
  CHIP_PROJECTS,
} from "@nand2tetris/projects/base.js";
import { parse as parseChip } from "@nand2tetris/simulator/chip/builder.js";
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
import {
  CompilationError,
  Span,
} from "@nand2tetris/simulator/languages/base.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { ChipTest } from "@nand2tetris/simulator/test/chiptst.js";

import { ImmPin, reducePins } from "../pinout.js";
import { useImmerReducer } from "../react.js";

import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";
import { RunSpeed } from "src/runbar.js";
import { compare } from "../compare.js";
import { BaseContext } from "./base.context.js";
import { Action } from "@nand2tetris/simulator/types.js";

export const NO_SCREEN = "noScreen";

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

export function isBuiltinOnly(
  project: keyof typeof CHIP_PROJECTS,
  chipName: string,
) {
  return BUILTIN_CHIP_PROJECTS[project].includes(chipName);
}

async function getTemplate(
  project: keyof typeof CHIP_PROJECTS,
  chipName: string,
) {
  const { ChipProjects } = await import("@nand2tetris/projects/full.js");
  if (isBuiltinOnly(project, chipName)) {
    return (ChipProjects[project].BUILTIN_CHIPS as Record<string, string>)[
      chipName
    ];
  }

  return (ChipProjects[project].CHIPS as Record<string, string>)[
    `${chipName}.hdl`
  ] as string;
}

async function getBuiltinCode(
  project: keyof typeof CHIP_PROJECTS,
  chipName: string,
) {
  const template = await getTemplate(project, chipName);
  if (isBuiltinOnly(project, chipName)) {
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
  config: ChipPageConfig;
}

export interface ChipPageConfig {
  speed: RunSpeed;
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
  tests: string[];
  testName: string;
  hasBuiltin: boolean;
  builtinOnly: boolean;
  runningTest: boolean;
  span?: Span;
  error?: CompilationError;
  visualizationParameters: Set<string>;
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
  setStatus: Action<string>,
  storage: Record<string, string>,
  dispatch: MutableRefObject<ChipStoreDispatch>,
) {
  const dropdowns = findDropdowns(storage);
  let { project, chipName } = dropdowns;
  const { chips } = dropdowns;
  let chip = new Low();
  let tests: string[] = [];
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
      },
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
      },
    ) {
      state.sim = reduceChip(
        chip,
        payload?.pending ?? state.sim.pending,
        payload?.invalid ?? state.sim.invalid,
      );
      state.controls.error = state.sim.invalid
        ? (payload?.error ?? state.controls.error)
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
      state.controls.tests = Array.from(tests);
      state.controls.hasBuiltin = REGISTRY.has(chipName);
      state.controls.builtinOnly = isBuiltinOnly(
        state.controls.project,
        chipName,
      );
    },

    setTest(state: ChipPageState, testName: string) {
      state.controls.testName = testName;
    },

    setVisualizationParams(state: ChipPageState, params: Set<string>) {
      state.controls.visualizationParameters = new Set(params);
    },

    testRunning(state: ChipPageState) {
      state.controls.runningTest = true;
    },

    testFinished(state: ChipPageState) {
      state.controls.runningTest = false;
      const passed = compare(state.files.cmp.trim(), state.files.out.trim());
      // For some reason, this is happening during a render but I can't track it down.
      Promise.resolve().then(() => {
        setStatus(
          passed
            ? `Simulation successful: The output file is identical to the compare file`
            : `Simulation error: The output file differs from the compare file`,
        );
      });
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

    updateConfig(state: ChipPageState, config: Partial<ChipPageConfig>) {
      state.config = { ...state.config, ...config };
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
      builtinOnly = isBuiltinOnly(
        project as keyof typeof CHIP_PROJECTS,
        chipName,
      );

      if (builtinOnly) {
        this.useBuiltin();
      } else {
        await this.loadChip(project, chipName);
        if (usingBuiltin) {
          this.useBuiltin();
        }
      }
      await this.initializeTest(chip);
      dispatch.current({ action: "setChip", payload: chipName });
    },

    setTest(test: string) {
      dispatch.current({ action: "setTest", payload: test });

      dispatch.current({
        action: "setVisualizationParams",
        payload: new Set(
          test == "ComputerAdd.tst" || test == "ComputerMax.tst"
            ? [NO_SCREEN]
            : [],
        ),
      });

      this.loadTest(test);
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
        setStatus(Err(maybeChip).message);
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
      const fsName = (ext: string) => `/projects/${project}/${name}.${ext}`;

      const hdl = await fs.readFile(fsName("hdl")).catch(() => makeHdl(name));

      dispatch.current({ action: "setFiles", payload: { hdl } });
      await this.compileChip(hdl);
    },

    async initializeTest(name: string) {
      tests = (await fs.scandir(`/projects/${project}`))
        .filter(
          (file) => file.name.startsWith(name) && file.name.endsWith(".tst"),
        )
        .map((file) => file.name);
      if (tests.length > 0) {
        await this.setTest(tests[0]);
      }
    },

    async loadTest(test: string) {
      const [tst, cmp] = await Promise.all([
        fs.readFile(`/projects/${project}/${test}`).catch(() => makeTst()),
        fs
          .readFile(`/projects/${project}/${test}`.replace(".tst", ".cmp"))
          .catch(() => makeCmp()),
      ]);
      dispatch.current({ action: "setFiles", payload: { cmp, tst } });
      this.compileTest(tst);
    },

    async saveChip(hdl: string, prj = project, name = chipName) {
      dispatch.current({ action: "setFiles", payload: { hdl } });
      const path = `/projects/${prj}/${name}.hdl`;
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
      const nextChip = await getBuiltinChip(builtinName);
      if (isErr(nextChip)) {
        setStatus(
          `Failed to load builtin ${builtinName}: ${display(Err(nextChip))}`,
        );
        return;
      }

      // Save hdl code that will be overwritten by the switch
      if (oldHdl) {
        await this.saveChip(oldHdl, project, chipName);
      }

      const hdl = await getBuiltinCode(project, builtinName);
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

      test = ChipTest.from(Ok(tst), setStatus).with(chip).reset();
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

    tick(): Promise<boolean> {
      return this.stepTest();
    },

    async stepTest(): Promise<boolean> {
      assert(test.chipId === chip.id, "Test and chip out of sync");
      const done = await test.step();
      dispatch.current({ action: "updateTestStep" });
      if (done) {
        dispatch.current({ action: "testFinished" });
      }
      return done;
    },

    async resetFile() {
      const { ChipProjects } = await import("@nand2tetris/projects/full.js");
      const template = (ChipProjects[project].CHIPS as Record<string, string>)[
        `${chipName}.hdl`
      ];
      dispatch.current({ action: "setFiles", payload: { hdl: template } });
    },

    async getProjectFiles() {
      return await Promise.all(
        CHIP_PROJECTS[project].map((chip) => ({
          name: `${chip}.hdl`,
          content: fs.readFile(`/projects/${project}/${chip}.hdl`),
        })),
      );
    },
  };

  const initialState: ChipPageState = (() => {
    const controls: ControlsState = {
      project,
      chips,
      chipName,
      tests,
      testName: "",
      hasBuiltin: REGISTRY.has(chipName),
      builtinOnly: isBuiltinOnly(project, chipName),
      runningTest: false,
      error: undefined,
      visualizationParameters: new Set(),
    };

    const sim = reduceChip(new Low());

    return {
      controls,
      files: {
        hdl: "",
        cmp: "",
        tst: "",
        out: "",
      },
      sim,
      config: { speed: 2 },
    };
  })();

  return { initialState, reducers, actions };
}

export function useChipPageStore() {
  const { fs, setStatus, storage } = useContext(BaseContext);

  const dispatch = useRef<ChipStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeChipStore(fs, setStatus, storage, dispatch),
    [fs, setStatus, storage, dispatch],
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
