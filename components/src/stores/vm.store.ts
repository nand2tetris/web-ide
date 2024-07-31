import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  Err,
  Result,
  isErr,
  unwrap,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { FIBONACCI } from "@nand2tetris/projects/base.js";
import {
  Format,
  KeyboardAdapter,
  MemoryAdapter,
  MemoryKeyboard,
} from "@nand2tetris/simulator/cpu/memory.js";
import {
  CompilationError,
  Span,
} from "@nand2tetris/simulator/languages/base.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { VM, VmInstruction } from "@nand2tetris/simulator/languages/vm.js";
import { VMTest, VmFile } from "@nand2tetris/simulator/test/vmtst.js";
import { Vm, VmFrame } from "@nand2tetris/simulator/vm/vm.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { ScreenScales } from "../chips/screen.js";
import { compare } from "../compare.js";
import { useImmerReducer } from "../react.js";
import { RunSpeed } from "../runbar.js";
import { BaseContext } from "./base.context.js";
import { ImmMemory } from "./imm_memory.js";

export const DEFAULT_TEST = "repeat {\n\tvmstep;\n}";

export interface VmSim {
  RAM: MemoryAdapter;
  Screen: MemoryAdapter;
  Keyboard: KeyboardAdapter;
  Stack: VmFrame[];
  Prog: VmInstruction[];
  Statics: number[];
  Temp: number[];
  AddedSysInit: boolean;
  highlight: number;
  showHighlight: boolean;
}

export interface VMTestSim {
  highlight: Span | undefined;
  path: string;
}

export interface VmPageState {
  vm: VmSim;
  controls: ControlsState;
  test: VMTestSim;
  files: VMFiles;
  title?: string;
  config: VmPageConfig;
}

export interface VmPageConfig {
  ram1Format: Format;
  ram2Format: Format;
  screenScale: ScreenScales;
  speed: RunSpeed;
  testSpeed: RunSpeed;
}

export interface ControlsState {
  runningTest: boolean;
  exitCode: number | undefined;
  animate: boolean;
  valid: boolean;
  error?: CompilationError;
}

export interface VMFiles {
  vm: string;
  tst: string;
  cmp: string;
  out: string;
}

export type VmStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeVmStore>["reducers"];
  payload?: unknown;
}>;

function reduceVMTest(
  vmTest: VMTest,
  dispatch: MutableRefObject<VmStoreDispatch>,
  setStatus: (status: string) => void,
  showHighlight: boolean,
): VmSim {
  const RAM = new ImmMemory(vmTest.vm.RAM, dispatch);
  const Screen = new ImmMemory(vmTest.vm.Screen, dispatch);
  const Keyboard = new MemoryKeyboard(new ImmMemory(vmTest.vm.RAM, dispatch));
  const highlight = vmTest.vm.derivedLine();

  let stack: VmFrame[] = [];
  try {
    stack = vmTest.vm.vmStack().reverse();
  } catch (e) {
    setStatus("Runtime error: Invalid stack");
  }

  return {
    Keyboard,
    RAM,
    Screen,
    Stack: stack,
    Prog: vmTest.vm.program,
    Statics: [
      ...vmTest.vm.memory.map((_, v) => v, 16, 16 + vmTest.vm.getStaticCount()),
    ],
    Temp: [...vmTest.vm.memory.map((_, v) => v, 5, 13)],
    AddedSysInit: vmTest.vm.addedSysInit,
    highlight,
    showHighlight,
  };
}

export function makeVmStore(
  fs: FileSystem,
  setStatus: (status: string) => void,
  storage: Record<string, string>,
  dispatch: MutableRefObject<VmStoreDispatch>,
) {
  const parsed = unwrap(VM.parse(FIBONACCI));
  let vm = unwrap(Vm.build(parsed.instructions));
  let test = new VMTest({ doEcho: setStatus }).with(vm);
  let useTest = false;
  let animate = true;
  let vmSource = "";
  let showHighlight = true;
  const reducers = {
    setVm(state: VmPageState, vm: string) {
      state.files.vm = vm;
    },
    setTst(state: VmPageState, { tst }: { tst: string }) {
      state.files.tst = tst;
    },
    setCmp(state: VmPageState, { cmp }: { cmp: string }) {
      state.files.cmp = cmp;
    },
    setExitCode(state: VmPageState, code: number | undefined) {
      state.controls.exitCode = code;
    },
    setValid(state: VmPageState, valid: boolean) {
      state.controls.valid = valid;
    },
    setShowHighlight(state: VmPageState, value: boolean) {
      state.vm.showHighlight = value;
    },
    setError(state: VmPageState, error?: CompilationError) {
      if (error) {
        state.controls.valid = false;
        setStatus(error?.message);
      } else {
        state.controls.valid = true;
      }
      state.controls.error = error;
    },
    setPath(state: VmPageState, path: string) {
      state.test.path = path;
    },
    update(state: VmPageState) {
      state.vm = reduceVMTest(test, dispatch, setStatus, showHighlight);
      state.test.highlight = test.currentStep?.span;
    },
    setAnimate(state: VmPageState, value: boolean) {
      state.controls.animate = value;
    },
    testStep(state: VmPageState) {
      state.files.out = test.log();
    },
    testFinished(state: VmPageState) {
      const passed = compare(state.files.cmp.trim(), state.files.out);
      setStatus(
        passed
          ? `Simulation successful: The output file is identical to the compare file`
          : `Simulation error: The output file differs from the compare file`,
      );
    },

    setTitle(state: VmPageState, title: string) {
      state.title = title;
    },

    updateConfig(state: VmPageState, config: Partial<VmPageConfig>) {
      state.config = { ...state.config, ...config };
    },
  };
  const initialState: VmPageState = {
    vm: reduceVMTest(test, dispatch, setStatus, true),
    controls: {
      exitCode: undefined,
      runningTest: false,
      animate: true,
      valid: true,
    },
    test: {
      highlight: undefined,
      path: "/",
    },
    files: {
      vm: "",
      tst: DEFAULT_TEST,
      cmp: "",
      out: "",
    },
    config: {
      ram1Format: "dec",
      ram2Format: "dec",
      screenScale: 1,
      speed: 2,
      testSpeed: 2,
    },
  };
  const actions = {
    async load(path: string) {
      const files: VmFile[] = [];
      let title: string;

      if (path.includes(".")) {
        // single file
        files.push({
          name: assertExists(path.split("/").pop()).replace(".vm", ""),
          content: await fs.readFile(path),
        });
        title = path.split("/").pop() ?? "";
      } else {
        // folder
        for (const file of (await fs.scandir(path)).filter(
          (entry) => entry.isFile() && entry.name.endsWith(".vm"),
        )) {
          files.push({
            name: file.name.replace(".vm", ""),
            content: await fs.readFile(`${path}/${file.name}`),
          });
        }
        title = `${path.split("/").pop()} / *.vm`;
      }
      dispatch.current({ action: "setTitle", payload: title });
      this.loadVm(files);
      this.reset();
      setStatus("");
    },
    setVm(content: string) {
      showHighlight = false;
      dispatch.current({
        action: "setVm",
        payload: content,
      });
      if (vmSource == content) {
        return;
      }
      vmSource = content;

      const parseResult = VM.parse(content);

      if (isErr(parseResult)) {
        dispatch.current({ action: "setError", payload: Err(parseResult) });
        return false;
      }
      const instructions = unwrap(parseResult).instructions;
      const buildResult = Vm.build(instructions);
      return this.replaceVm(buildResult);
    },
    loadVm(files: VmFile[]) {
      showHighlight = false;

      const content = files.map((f) => f.content).join("\n");
      dispatch.current({
        action: "setVm",
        payload: content,
      });

      if (vmSource == content) {
        return;
      }
      vmSource = content;

      const parsed = [];

      let lineOffset = 0;
      for (const file of files) {
        const parseResult = VM.parse(file.content);

        if (isErr(parseResult)) {
          dispatch.current({ action: "setError", payload: Err(parseResult) });
          return false;
        }
        const instructions = unwrap(parseResult).instructions;

        for (const instruction of instructions) {
          if (instruction.span?.line != undefined) {
            instruction.span.line += lineOffset;
          }
        }
        lineOffset += file.content.split("\n").length;

        parsed.push({
          name: file.name,
          instructions,
        });
      }
      const buildResult = Vm.buildFromFiles(parsed);
      return this.replaceVm(buildResult);
    },
    replaceVm(buildResult: Result<Vm, CompilationError>) {
      if (isErr(buildResult)) {
        dispatch.current({ action: "setError", payload: Err(buildResult) });
        return false;
      }
      dispatch.current({ action: "setError" });
      // setStatus("Compiled VM code successfully");

      vm = unwrap(buildResult);
      test.vm = vm;
      dispatch.current({ action: "update" });
      return true;
    },

    loadTest(path: string, source: string) {
      dispatch.current({ action: "setTst", payload: { tst: source } });
      const tst = TST.parse(source);

      if (isErr(tst)) {
        dispatch.current({ action: "setValid", payload: false });
        setStatus(`Failed to parse test`);
        return false;
      }
      dispatch.current({ action: "setValid", payload: true });
      setStatus(`Parsed tst`);

      vm.reset();
      test = VMTest.from(unwrap(tst), {
        dir: path,
        doLoad: async (path) => {
          await this.load(path);
        },
        doEcho: setStatus,
        compareTo: async (file) => {
          const dir = path.split("/").slice(0, -1).join("/");
          const cmp = await fs.readFile(`${dir}/${file}`);
          dispatch.current({ action: "setCmp", payload: { cmp } });
        },
      }).using(fs);
      test.vm = vm;
      dispatch.current({ action: "update" });
      return true;
    },
    setAnimate(value: boolean) {
      animate = value;
      dispatch.current({ action: "setAnimate", payload: value });
    },
    async testStep() {
      showHighlight = true;
      let done = false;
      try {
        done = await test.step();
        dispatch.current({ action: "testStep" });
        if (done) {
          dispatch.current({ action: "testFinished" });
        }
        if (animate) {
          dispatch.current({ action: "update" });
        }
        return done;
      } catch (e) {
        setStatus(`Runtime error: ${(e as Error).message}`);
        dispatch.current({ action: "setValid", payload: false });
        return true;
      }
    },
    setPaused(paused = true) {
      vm.setPaused(paused);
    },
    step() {
      showHighlight = true;
      try {
        let done = false;

        const exitCode = vm.step();
        if (exitCode !== undefined) {
          done = true;
          dispatch.current({ action: "setExitCode", payload: exitCode });
        }

        if (animate) {
          dispatch.current({ action: "update" });
        }
        return done;
      } catch (e) {
        setStatus(`Runtime error: ${(e as Error).message}`);
        dispatch.current({ action: "setValid", payload: false });
        return true;
      }
    },
    reset() {
      showHighlight = true;
      test.reset();
      vm.reset();
      dispatch.current({ action: "update" });
      dispatch.current({ action: "setExitCode", payload: undefined });
      dispatch.current({ action: "setValid", payload: true });
    },
    toggleUseTest() {
      useTest = !useTest;
      dispatch.current({ action: "update" });
    },
    initialize() {
      dispatch.current({ action: "setTitle", payload: undefined });
      this.setVm(FIBONACCI);
    },
  };

  return { initialState, reducers, actions };
}

export function useVmPageStore() {
  const { fs, setStatus, storage } = useContext(BaseContext);

  const dispatch = useRef<VmStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeVmStore(fs, setStatus, storage, dispatch),
    [fs, setStatus, storage, dispatch],
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
