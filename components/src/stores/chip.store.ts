import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import { Err, isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  BUILTIN_CHIP_PROJECTS,
  // CHIP_ORDER,
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
import { toast } from "react-toastify";

import { ImmPin, reducePins } from "../pinout.js";
import { useImmerReducer } from "../react.js";

import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { getBuiltinChip } from "@nand2tetris/simulator/chip/builtins/index.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
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

// function getChips(project: keyof typeof CHIP_PROJECTS) {
//   return project in CHIP_ORDER
//     ? (CHIP_ORDER as Record<typeof project, string[]>)[project]
//     : BUILTIN_CHIP_PROJECTS[project].concat(CHIP_PROJECTS[project]);
// }

// function findDropdowns(storage: Record<string, string>) {
//   const project =
//     (storage["/chip/project"] as keyof typeof CHIP_PROJECTS) ?? "01";
//   const chips = getChips(project);
//   const chipName = storage["/chip/chip"] ?? CHIP_PROJECTS[project][0];
//   return { project, chips, chipName };
// }

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
  project: keyof typeof CHIP_PROJECTS;
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
  setStatus: (status: string) => void,
  storage: Record<string, string>,
  dispatch: MutableRefObject<ChipStoreDispatch>,
) {
  // const dropdowns = findDropdowns(storage);
  // const { chips } = dropdowns;
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

    // setProject(state: ChipPageState, project: keyof typeof CHIP_PROJECTS) {
    //   const chips = getChips(project);
    //   const chipName =
    //     state.controls.chipName && chips.includes(state.controls.chipName)
    //       ? state.controls.chipName
    //       : chips[0];
    //   state.controls.project = project;
    //   state.controls.chips = chips;
    //   this.setChip(state, chipName);
    // },

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
      // state.controls.hasBuiltin = REGISTRY.has(chipName);
      // state.controls.builtinOnly = isBuiltinOnly(
      //   state.controls.project,
      //   chipName,
      // );
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
    // setProject(p: keyof typeof CHIP_PROJECTS) {
    //   project = storage["/chip/project"] = p;
    //   dispatch.current({ action: "setProject", payload: project });
    //   this.setChip(CHIP_PROJECTS[project][0]);
    // },

    // async setChip(chip: string, project = storage["/chip/project"] ?? "01") {

    //   builtinOnly = isBuiltinOnly(
    //     project as keyof typeof CHIP_PROJECTS,
    //     chipName,
    //   );

    //   if (builtinOnly) {
    //     this.useBuiltin();
    //   } else {
    //     await this.loadChip(project, chipName);
    //     if (usingBuiltin) {
    //       this.useBuiltin();
    //     }
    //   }
    //   await this.initializeTest(chip);
    //   dispatch.current({ action: "setChip", payload: chipName });
    // },

    // setTest(test: string) {
    //   dispatch.current({ action: "setTest", payload: test });

    //   dispatch.current({
    //     action: "setVisualizationParams",
    //     payload: new Set(
    //       test == "ComputerAdd.tst" || test == "ComputerMax.tst"
    //         ? [NO_SCREEN]
    //         : [],
    //     ),
    //   });

    //   this.loadTest(test);
    // },

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
      tstPath,
    }: {
      hdl?: string;
      tst?: string;
      cmp: string;
      tstPath?: string;
    }) {
      invalid = false;
      dispatch.current({ action: "setFiles", payload: { hdl, tst, cmp } });
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
      test = test.with(chip).reset();
      dispatch.current({ action: "updateChip", payload: { invalid: false } });
      dispatch.current({ action: "updateTestStep" });
    },

    async initializeTests(dir: string, chip: string) {
      tests = TEST_NAMES[chip] ?? [];
      this.loadTest(tests[0] ?? chip, dir);

      // tests = (await fs.scandir(`/projects/${project}/${name}`))
      //   .filter((file) => file.name.endsWith(".tst"))
      //   .map((file) => file.name);
      // if (tests.length > 0) {
      //   await this.setTest(tests[0]);
      // }
    },

    async loadTest(name: string, dir?: string) {
      if (!fs) return;
      try {
        dir ??= _dir;

        const tst = await fs.readFile(`${dir}/${name}.tst`);

        // TODO: if not using local fs, either load cmp file here or add compare-to inst to local storage test scripts

        dispatch.current({ action: "setFiles", payload: { tst, cmp: "" } });
        dispatch.current({ action: "setTest", payload: name });
        this.compileTest(tst, dir);
      } catch (e) {
        toast(`Could not find ${name}.tst. Please load test file separately.`, {
          type: "error",
        });
        console.error(e);
      }
      // const [tst, cmp] = await Promise.all([
      //   fs
      //     .readFile(`/projects/${project}/${chipName}/${test}`)
      //     .catch(() => makeTst()),
      //   fs
      //     .readFile(
      //       `/projects/${project}/${chipName}/${test}`.replace(".tst", ".cmp"),
      //     )
      //     .catch(() => makeCmp()),
      // ]);
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
      // dispatch.current({ action: "setFiles", payload: { hdl } });
      this.replaceChip(Ok(nextChip));
    },

    async toggleBuiltin() {
      usingBuiltin = !usingBuiltin;
      dispatch.current({ action: "toggleBuiltin" });
      if (usingBuiltin) {
        await this.loadBuiltin();
      } else {
        await this.compileChip(backupHdl);
      }
    },

    // async initialize() {
    //   await this.setChip(chipName, project);
    // },

    compileTest(file: string, path: string) {
      if (!fs) return;
      dispatch.current({ action: "setFiles", payload: { tst: file } });
      const tst = TST.parse(file);
      if (isErr(tst)) {
        setStatus(`Failed to parse test ${Err(tst).message}`);
        invalid = true;
        return false;
      }
      test = ChipTest.from(
        Ok(tst),
        setStatus,
        async (file) => {
          const cmp = await fs.readFile(`${_dir}/${file}`);
          dispatch.current({ action: "setFiles", payload: { cmp } });
        },
        path,
      )
        .with(chip)
        .reset();
      test.setFileSystem(fs);
      dispatch.current({ action: "updateTestStep" });
      return true;
    },

    async runTest(file: string) {
      // if (!this.compileTest(file)) {
      //   return;
      // }
      // dispatch.current({ action: "testRunning" });
      // fs.pushd("/samples");
      // await test.run();
      // fs.popd();
      // dispatch.current({ action: "updateTestStep" });
      // dispatch.current({ action: "testFinished" });
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
      // const { ChipProjects } = await import("@nand2tetris/projects/full.js");
      // const template = (
      //   ChipProjects[project].CHIPS as Record<string, Record<string, string>>
      // )[chipName][`${chipName}.hdl`];
      // dispatch.current({ action: "setFiles", payload: { hdl: template } });
    },

    async getProjectFiles() {
      // return await Promise.all(
      //   CHIP_PROJECTS[project].map((chip) => ({
      //     name: `${chip}.hdl`,
      //     content: fs.readFile(`/projects/${project}/${chip}/${chip}.hdl`),
      //   })),
      // );
    },

    // TODO: optimize. Maybe create a mapping in initialization
    async findPath(
      fs: FileSystem,
      name: string,
    ): Promise<string[] | undefined> {
      if (!fs) return;

      async function findIn(
        fs: FileSystem,
        path: string[] = [],
      ): Promise<string[] | undefined> {
        const fullPath = path.length == 0 ? "." : path.join("/");
        for (const entry of await fs.scandir(fullPath)) {
          if (entry.isDirectory()) {
            const found = await findIn(fs, [...path, entry.name]);
            if (found) {
              return [...path, ...found];
            }
          } else {
            if (entry.name == name) {
              return [...path, name];
            }
          }
        }
        return;
      }

      return await findIn(fs);
    },

    async loadChip(path: string) {
      usingBuiltin = false;

      // const name = handle.name.replace(".hdl", "");
      // const path = `/${dir}/${name}.hdl`;
      const hdl = await fs.readFile(path);

      // hdlPath = path.join("/");
      const parts = path.split("/");
      const name = parts.pop()!.replace(".hdl", "");
      const dir = parts.join("/");

      await this.compileChip(hdl, dir, name);
      await this.initializeTests(dir, name);
      dispatch.current({
        action: "setChip",
        payload: { chipName: name, dir: dir },
      });
      dispatch.current({ action: "setFiles", payload: { hdl } });
    },

    // TODO: currently doesn't support 2 chips with the same name in different projects
    async loadLocalChip(handle: FileSystemFileHandle) {
      const path = await this.findPath(fs, handle.name);

      if (!path) {
        // TODO: turn into warning?
        setStatus(`${handle.name} is not inside the projects directory`);
        return;
      }

      console.log(path);

      await this.loadChip(`/${path.join("/")}`);
    },

    async saveChip(hdl: string) {
      dispatch.current({ action: "setFiles", payload: { hdl } });
      const path = `${_dir}/${_chipName}.hdl`;
      if (fs && path) {
        await fs.writeFile(path, hdl);
      }
    },
  };

  const initialState: ChipPageState = (() => {
    const controls: ControlsState = {
      project: "01",
      chips: [],
      chipName: "",
      tests,
      testName: "",
      // hasBuiltin: false,
      // builtinOnly: false,
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
