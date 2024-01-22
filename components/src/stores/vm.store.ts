import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
// import { VM as multVM } from "@nand2tetris/simulator/testing/mult.js";
import { FIBONACCI } from "@nand2tetris/projects/samples/vm.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { BaseContext } from "./base.context.js";
import { useImmerReducer } from "../react.js";
import {
  KeyboardAdapter,
  MemoryAdapter,
  MemoryKeyboard,
} from "@nand2tetris/simulator/cpu/memory.js";
import { VMTest } from "@nand2tetris/simulator/test/vmtst.js";
import { VM, VmInstruction } from "@nand2tetris/simulator/languages/vm.js";
import { ImmMemory } from "./imm_memory.js";
import { isErr, unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { VmFrame, Vm } from "@nand2tetris/simulator/vm/vm.js";
import { Span } from "@nand2tetris/simulator/languages/base.js";
import { compare } from "../compare.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";

export interface VmSim {
  RAM: MemoryAdapter;
  Screen: MemoryAdapter;
  Keyboard: KeyboardAdapter;
  Stack: VmFrame[];
  Prog: VmInstruction[];
  highlight: number;
}

export interface VMTestSim {
  useTest: boolean;
  highlight: Span | undefined;
}

export interface VmPageState {
  vm: VmSim;
  controls: ControlsState;
  test: VMTestSim;
  files: VMFiles;
}

export interface ControlsState {
  runningTest: boolean;
  error: string;
}

export interface VMFiles {
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
  dispatch: MutableRefObject<VmStoreDispatch>
): VmSim {
  const RAM = new ImmMemory(vmTest.vm.RAM, dispatch);
  const Screen = new ImmMemory(vmTest.vm.Screen, dispatch);
  const Keyboard = new MemoryKeyboard(
    new ImmMemory(vmTest.vm.Keyboard, dispatch)
  );
  const highlight = vmTest.vm.derivedLine();

  return {
    Keyboard,
    RAM,
    Screen,
    Stack: vmTest.vm.vmStack().reverse(),
    Prog: vmTest.vm.program,
    highlight,
  };
}

export function makeVmStore(
  fs: FileSystem,
  setStatus: (status: string) => void,
  storage: Record<string, string>,
  dispatch: MutableRefObject<VmStoreDispatch>
) {
  const parsed = unwrap(VM.parse(FIBONACCI));
  let vm = unwrap(Vm.build(parsed.instructions));
  let test = new VMTest().with(vm);
  let useTest = false;
  const reducers = {
    setTst(state: VmPageState, { tst, cmp }: { tst: string; cmp?: string }) {
      state.files.tst = tst;
      state.files.cmp = cmp ?? "";
    },
    update(state: VmPageState) {
      state.vm = reduceVMTest(test, dispatch);
      state.test.useTest = useTest;
      state.test.highlight = test.currentStep?.span;
    },
    testStep(state: VmPageState) {
      state.files.out = test.log();
    },
    testFinished(state: VmPageState) {
      const passed = compare(state.files.cmp.trim(), state.files.out);
      setStatus(
        passed
          ? `Simulation successful: The output file is identical to the compare file`
          : `Simulation error: The output file differs from the compare file`
      );
    },
  };
  const initialState: VmPageState = {
    vm: reduceVMTest(test, dispatch),
    controls: {
      error: "",
      runningTest: false,
    },
    test: {
      useTest,
      highlight: undefined,
    },
    files: {
      tst: "",
      cmp: "",
      out: "",
    },
  };
  const actions = {
    loadVm(source: string) {
      const parseResult = VM.parse(source);

      if (isErr(parseResult)) {
        setStatus(`Error parsing vm file = ${parseResult.err}`);
        return;
      }

      const buildResult = Vm.build(unwrap(parseResult).instructions);

      if (isErr(buildResult)) {
        setStatus(`Error building vm file = ${buildResult.err}`);
        return;
      }

      vm = unwrap(buildResult);
      test.vm = vm;
      test.reset();
      dispatch.current({ action: "update" });
    },
    loadTest(source: string, cmp?: string) {
      dispatch.current({ action: "setTst", payload: { tst: source, cmp } });
      const tst = TST.parse(source);

      if (isErr(tst)) {
        setStatus(`Failed to parse test`);
        return false;
      }
      setStatus(`Parsed tst`);

      vm.reset();
      test = VMTest.from(unwrap(tst));
      test.vm = vm;
      dispatch.current({ action: "update" });
      return true;
    },
    step() {
      let done = false;
      if (useTest) {
        done = test.step();
        dispatch.current({ action: "testStep" });
        if (done) {
          dispatch.current({ action: "testFinished" });
        }
      } else {
        vm.step();
      }
      dispatch.current({ action: "update" });
      return done;
    },
    reset() {
      test.reset();
      vm.reset();
      dispatch.current({ action: "update" });
    },
    toggleUseTest() {
      useTest = !useTest;
      dispatch.current({ action: "update" });
    },
    initialize() {
      this.loadTest("repeat {\n\tvmstep;\n}", "");
      dispatch.current({ action: "update" });
    },
  };

  return { initialState, reducers, actions };
}

export function useVmPageStore() {
  const { fs, setStatus, storage } = useContext(BaseContext);

  const dispatch = useRef<VmStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeVmStore(fs, setStatus, storage, dispatch),
    [fs, setStatus, storage, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
