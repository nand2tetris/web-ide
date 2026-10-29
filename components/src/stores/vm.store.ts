import { assertExists } from "@davidsouther/jiffies/assert.ts";
import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { Err, isErr, Ok, unwrap } from "@davidsouther/jiffies/result.ts";
import { FIBONACCI } from "@nand2tetris/projects/base.js";
import {
  Format,
  KeyboardAdapter,
  MemoryAdapter,
  MemoryKeyboard,
} from "@nand2tetris/simulator/cpu/memory.js";
import {
  type Diagnostic,
  Span,
  validOf,
} from "@nand2tetris/simulator/languages/base.js";
import { VM, VmInstruction } from "@nand2tetris/simulator/languages/vm.js";
import { buildTst } from "@nand2tetris/simulator/test/builder.js";
import { VMTest } from "@nand2tetris/simulator/test/vmtst.js";
import { Action } from "@nand2tetris/simulator/types.js";
import {
  joinedDiagnostics,
  loadVm,
  VM_INPUT,
  Vm,
  VmFile,
  VmFrame,
} from "@nand2tetris/simulator/vm/vm.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { ScreenScales } from "../chips/screen.js";
import { useImmerReducer } from "../react.js";
import { RunSpeed } from "../runbar.js";
import { BaseContext, StatusSeverity } from "./base.context.js";
import { ImmMemory } from "./imm_memory.js";
import { comparisonStatus, failureStatus } from "./status.js";

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
  /** Every diagnostic of the last compile or run. */
  diagnostics: readonly Diagnostic[];
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
  setStatus: Action<string | { message: string; severity?: StatusSeverity }>,
  showHighlight: boolean,
): VmSim {
  const RAM = new ImmMemory(vmTest.vm.RAM, dispatch);
  const Screen = new ImmMemory(vmTest.vm.Screen, dispatch);
  const Keyboard = new MemoryKeyboard(new ImmMemory(vmTest.vm.RAM, dispatch));
  const highlight = vmTest.vm.derivedLine();

  let stack: VmFrame[] = [];
  try {
    stack = vmTest.vm.vmStack().reverse();
  } catch (_e) {
    const error = new Error("Runtime error: Invalid stack");
    setStatus({ message: error.message, severity: "ERROR" });
    dispatch.current({ action: "setDiagnostics", payload: [error] });
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
  setStatus: Action<string | { message: string; severity?: StatusSeverity }>,
  storage: Record<string, string>,
  dispatch: MutableRefObject<VmStoreDispatch>,
  attemptRecovery: () => boolean = () => true,
) {
  const parsed = unwrap(validOf(VM.parse(FIBONACCI)));
  let vm = unwrap(Vm.build(parsed.instructions));
  let test = new VMTest({ doEcho: setStatus }).with(vm);
  let useTest = false;
  let animate = true;
  let vmSource = "";
  let loadedFiles: VmFile[] = [];
  let showHighlight = true;
  /** The last source compiled, for `recompile`. */
  let compiled: { files: VmFile[]; single: boolean } | undefined;

  /** Shows the diagnostics of VM code that did not compile. */
  const compileFailed = (diagnostics: readonly Diagnostic[]) => {
    setStatus(failureStatus("VM code", diagnostics, { head: true }));
    dispatch.current({ action: "setDiagnostics", payload: diagnostics });
    return false;
  };

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
    setDiagnostics(
      state: VmPageState,
      diagnostics: readonly Diagnostic[] = [],
    ) {
      state.controls.valid = diagnostics.length === 0;
      state.controls.diagnostics = diagnostics;
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
      setStatus(comparisonStatus(state.files.cmp.trim(), state.files.out));
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
      diagnostics: [],
    },
    test: {
      highlight: undefined,
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

      // `fs.stat` rejects with `undefined` for a missing path.
      const stat = await fs.stat(path).catch(() => undefined);

      if (stat?.isFile()) {
        // single file
        files.push({
          name: assertExists(path.split("/").pop()).replace(".vm", ""),
          content: await fs.readFile(path),
        });
        title = path.split("/").pop() ?? "";
      } else {
        // folder
        const entries = stat ? await fs.scandir(path) : [];
        for (const file of entries.filter(
          (entry) => entry.isFile() && entry.name.endsWith(".vm"),
        )) {
          files.push({
            name: file.name.replace(".vm", ""),
            content: await fs.readFile(`${path}/${file.name}`),
          });
        }
        title = `${path.split("/").pop()} / *.vm`;

        // A bare `load,` from a test uploaded from disk has no directory to
        // scan. Keep the VM files the user already loaded (#673).
        if (files.length === 0 && !path && loadedFiles.length > 0) {
          this.reset();
          setStatus("");
          return;
        }
        if (!stat) throw new Error(`Cannot find ${path}`);
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

      // One buffer has no file name for its functions' class prefixes to match.
      return this.compile([{ name: VM_INPUT, content }], true);
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
      loadedFiles = files;

      return this.compile(files, false);
    },
    /**
     * Loads `files` to a VM, or shows every diagnostic of them. A `single`
     * buffer skips only the check of function class prefixes against file names.
     */
    compile(files: VmFile[], single: boolean) {
      compiled = { files, single };
      const loaded = loadVm(files, {
        attemptRecovery: attemptRecovery(),
        validateFileNames: !single,
      });
      if (isErr(loaded)) {
        // The editor shows the files as one joined buffer.
        return compileFailed(joinedDiagnostics(files, Err(loaded)));
      }
      dispatch.current({ action: "setDiagnostics" });
      // setStatus("Compiled VM code successfully");

      vm = unwrap(loaded);
      test.vm = vm;
      dispatch.current({ action: "update" });
      return true;
    },
    /** Compiles the source again, as when the Attempt Recovery setting changes. */
    recompile() {
      if (compiled) {
        showHighlight = false;
        this.compile(compiled.files, compiled.single);
      }
    },

    loadTest(path: string, source: string) {
      dispatch.current({ action: "setTst", payload: { tst: source } });
      const maybeTest = buildTst({ name: path, content: source }, "vm", {
        attemptRecovery: attemptRecovery(),
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
      });
      if (isErr(maybeTest)) {
        dispatch.current({ action: "setValid", payload: false });
        setStatus(
          failureStatus("Test script", Err(maybeTest), { marked: false }),
        );
        return false;
      } else {
        dispatch.current({ action: "setValid", payload: true });
        setStatus(`Parsed tst`);
        vm.reset();
        test = Ok(maybeTest).using(fs);
        test.vm = vm;
        dispatch.current({ action: "update" });
        return true;
      }
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
        const error = e instanceof Error ? e : new Error(String(e));
        setStatus({
          message: `Runtime error: ${error.message}`,
          severity: "ERROR",
        });
        dispatch.current({ action: "setDiagnostics", payload: [error] });
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
        const error = e instanceof Error ? e : new Error(String(e));
        setStatus({
          message: `Runtime error: ${error.message}`,
          severity: "ERROR",
        });
        dispatch.current({ action: "setDiagnostics", payload: [error] });
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
  const { fs, setStatus, storage, attemptRecovery } = useContext(BaseContext);

  const dispatch = useRef<VmStoreDispatch>(() => undefined);
  // The store outlives a change of the setting, so it reads the latest.
  const recovery = useRef(attemptRecovery);
  recovery.current = attemptRecovery;

  const { initialState, reducers, actions } = useMemo(
    () => makeVmStore(fs, setStatus, storage, dispatch, () => recovery.current),
    [fs, setStatus, storage, dispatch],
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
