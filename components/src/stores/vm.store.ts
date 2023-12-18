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
import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { VmFrame, Vm } from "@nand2tetris/simulator/vm/vm.js";
import { Span } from "@nand2tetris/simulator/languages/base.js";

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
}

export interface ControlsState {
  runningTest: boolean;
  error: string;
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
  const vm = unwrap(Vm.build(parsed.instructions));
  const test = new VMTest().with(vm);
  let useTest = false;
  const reducers = {
    update(state: VmPageState) {
      state.vm = reduceVMTest(test, dispatch);
      state.test.useTest = useTest;
      state.test.highlight = test.currentStep?.span;
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
  };
  const actions = {
    step() {
      if (useTest) {
        test.step();
      } else {
        vm.step();
      }
      dispatch.current({ action: "update" });
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
