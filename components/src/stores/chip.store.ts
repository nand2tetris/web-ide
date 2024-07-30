import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  BUILTIN_CHIP_PROJECTS,
  CHIP_PROJECTS,
} from "@nand2tetris/projects/base.js";
import { parse as parseChip } from "@nand2tetris/simulator/chip/builder.js";
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
import { ChipTest } from "@nand2tetris/simulator/test/chiptst.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";

import { ImmPin, reducePins } from "../pinout.js";
import { useImmerReducer } from "../react.js";

import { assert, assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { getBuiltinChip } from "@nand2tetris/simulator/chip/builtins/index.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { Action } from "@nand2tetris/simulator/types.js";
import { compare } from "../compare.js";
import { RunSpeed } from "../runbar.js";
import { BaseContext } from "./base.context.js";

export const NO_SCREEN = "noScreen";

export const PROJECT_NAMES = [
  ["01", `Project 1`],
  ["02", `Project 2`],
  ["03", `Project 3`],
  ["05", `Project 5`],
];

const TEST_NAMES: Record<string, string[]> = {
  CPU: ["CPU", "CPU-external"],
  Computer: ["ComputerAdd", "ComputerMax", "ComputerRect"],
};

export function isBuiltinOnly(
  project: keyof typeof CHIP_PROJECTS,
  chipName: string,
) {
  return BUILTIN_CHIP_PROJECTS[project].includes(chipName);
}

function convertToBuiltin(name: string, hdl: string) {
  return hdl.replace(/PARTS:([\s\S]*?)\}/, `PARTS:\n\tBUILTIN ${name};`);
}

export interface ChipPageState {
  title?: string;
  files: Files;
  sim: ChipSim;
  controls: ControlsState;
  config: ChipPageConfig;
  dir?: string;
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
  projects: string[];
  project: string;
  chips: string[];
  chipName: string;
  tests: string[];
  testName: string;
  usingBuiltin: boolean;
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
  upgraded: boolean,
) {
  let _chipName = "";
  let _dir = "";
  let chip = new Low();
  let backupHdl = "";
  let tests: string[] = [];
  let test = new ChipTest();
  let usingBuiltin = false;
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
        ? payload?.error ?? state.controls.error
        : undefined;
    },

    setProjects(state: ChipPageState, projects: string[]) {
      state.controls.projects = projects;
    },

    setProject(state: ChipPageState, project: keyof typeof CHIP_PROJECTS) {
      state.controls.project = project;
    },

    setChips(state: ChipPageState, chips: string[]) {
      state.controls.chips = chips;
    },

    setChip(
      state: ChipPageState,
      { chipName, dir }: { chipName: string; dir: string },
    ) {
      _dir = dir;
      _chipName = chipName;
      state.controls.chipName = chipName;
      state.title = `${chipName}.hdl`;
      state.controls.tests = Array.from(tests);
      state.dir = dir;
    },

    clearChip(state: ChipPageState) {
      _chipName = "";
      state.controls.chipName = "";
      state.title = undefined;
      state.controls.tests = [];

      this.setFiles(state, { hdl: "", tst: "", cmp: "", out: "" });
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

    updateUsingBuiltin(state: ChipPageState) {
      state.controls.usingBuiltin = usingBuiltin;
    },

    toggleBuiltin(state: ChipPageState) {
      state.controls.usingBuiltin = usingBuiltin;
      if (usingBuiltin) {
        backupHdl = state.files.hdl;
        this.setFiles(state, {
          hdl: convertToBuiltin(state.controls.chipName, state.files.hdl),
        });
      } else {
        this.setFiles(state, { hdl: backupHdl });
      }
    },
  };

  const actions = {
    async initialize() {
      if (upgraded) {
        dispatch.current({
          action: "setProjects",
          payload: ["1", "2", "3", "5"],
        });
        await actions.setProject("1");
      } else {
        dispatch.current({
          action: "setProjects",
          payload: ["01", "02", "03", "05"],
        });
        await actions.setProject("01");
      }

      dispatch.current({ action: "clearChip" });
    },

    reset() {
      Clock.get().reset();
      chip.reset();
      test.reset();
      dispatch.current({ action: "setFiles", payload: {} });
      dispatch.current({ action: "updateChip" });
    },

    async setProject(project: string) {
      project = storage["/chip/project"] = project;
      dispatch.current({ action: "setProject", payload: project });

      const chips = (
        await fs.scandir(upgraded ? `/${project}` : `/projects/${project}`)
      )
        .filter((entry) => entry.isFile() && entry.name.endsWith(".hdl"))
        .map((file) => file.name.replace(".hdl", ""));
      dispatch.current({ action: "setChips", payload: chips });
    },

    async loadChip(path: string, loadTests = true) {
      usingBuiltin = false;
      dispatch.current({ action: "updateUsingBuiltin", payload: false });

      const hdl = await fs.readFile(path);

      const parts = path.split("/");
      const name = assertExists(parts.pop()).replace(".hdl", "");
      const dir = parts.join("/");

      await this.compileChip(hdl, dir, name);

      if (loadTests) {
        await this.initializeTests(dir, name);
      }

      dispatch.current({
        action: "setChip",
        payload: { chipName: name, dir: dir },
      });
      dispatch.current({ action: "setFiles", payload: { hdl } });
    },

    async compileChip(hdl: string, dir?: string, name?: string) {
      chip.remove();
      const maybeChip = await parseChip(hdl, dir, name, fs);
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
      console.log("setting chip, id:", chip.id);
      // test = test.with(chip).reset();
      dispatch.current({ action: "updateChip", payload: { invalid: false } });
      dispatch.current({ action: "updateTestStep" });
    },

    async initializeTests(dir: string, chip: string) {
      tests = TEST_NAMES[chip] ?? [];
      this.loadTest(tests[0] ?? chip, dir);
    },

    async loadTest(name: string, dir?: string) {
      if (!fs) return;
      try {
        dir ??= _dir;

        const tst = await fs.readFile(`${dir}/${name}.tst`);

        dispatch.current({ action: "setFiles", payload: { tst, cmp: "" } });
        dispatch.current({ action: "setTest", payload: name });
        this.compileTest(tst, dir);
      } catch (e) {
        setStatus(
          `Could not find ${name}.tst. Please load test file separately.`,
        );
        console.error(e);
      }
    },

    compileTest(file: string, path: string) {
      if (!fs) return;
      dispatch.current({ action: "setFiles", payload: { tst: file } });
      const tst = TST.parse(file);
      if (isErr(tst)) {
        setStatus(`Failed to parse test ${Err(tst).message}`);
        invalid = true;
        return false;
      }
      console.log("creating test", path);
      test = ChipTest.from(
        Ok(tst),
        path,
        setStatus,
        async (file) => {
          console.log("loading from test", file);
          await this.loadChip(file, false);
          return chip;
        },
        async (file) => {
          const cmp = await fs.readFile(`${_dir}/${file}`);
          dispatch.current({ action: "setFiles", payload: { cmp } });
        },
      )
        .with(chip)
        .reset();
      test.setFileSystem(fs);
      dispatch.current({ action: "updateTestStep" });
      return true;
    },

    async updateFiles({
      hdl,
      tst,
      cmp,
      tstPath,
    }: {
      hdl?: string;
      tst?: string;
      cmp: string;
      tstPath?: string;
    }) {
      invalid = false;
      dispatch.current({ action: "setFiles", payload: { hdl, tst, cmp } });
      console.log("calling update files");
      try {
        if (hdl) {
          await this.compileChip(hdl, _dir, _chipName);
        }
        if (tst) {
          this.compileTest(tst, tstPath ?? _dir);
        }
      } catch (e) {
        setStatus(display(e));
      }
      dispatch.current({ action: "updateChip", payload: { invalid: invalid } });
      if (!invalid) {
        setStatus(`HDL code: No syntax errors`);
      }
    },

    async saveChip(hdl: string) {
      dispatch.current({ action: "setFiles", payload: { hdl } });
      const path = `${_dir}/${_chipName}.hdl`;
      if (fs && path) {
        await fs.writeFile(path, hdl);
      }
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

    async loadBuiltin() {
      const builtinName = _chipName;
      const nextChip = await getBuiltinChip(builtinName);
      if (isErr(nextChip)) {
        setStatus(
          `Failed to load builtin ${builtinName}: ${display(Err(nextChip))}`,
        );
        return;
      }
      this.replaceChip(Ok(nextChip));
    },

    async toggleBuiltin() {
      usingBuiltin = !usingBuiltin;
      dispatch.current({ action: "toggleBuiltin" });
      if (usingBuiltin) {
        await this.loadBuiltin();
      } else {
        await this.compileChip(backupHdl, _dir, _chipName);
      }
    },

    tick(): Promise<boolean> {
      return this.stepTest();
    },

    async stepTest(): Promise<boolean> {
      assert(test.chipId === chip.id, "Test and chip out of sync");
      try {
        const done = await test.step();
        dispatch.current({ action: "updateTestStep" });
        if (done) {
          dispatch.current({ action: "testFinished" });
        }
        return done;
      } catch (e) {
        setStatus((e as Error).message);
        return true;
      }
    },
  };

  const initialState: ChipPageState = (() => {
    const controls: ControlsState = {
      projects: ["1", "2", "3", "5"],
      project: "1",
      chips: [],
      chipName: "",
      tests,
      testName: "",
      usingBuiltin: false,
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
        backupHdl: "",
      },
      sim,
      config: { speed: 2 },
    };
  })();

  return { initialState, reducers, actions };
}

export function useChipPageStore() {
  const { fs, setStatus, storage, localFsRoot } = useContext(BaseContext);

  const dispatch = useRef<ChipStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () =>
      makeChipStore(fs, setStatus, storage, dispatch, localFsRoot != undefined),
    [fs, setStatus, storage, dispatch],
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
