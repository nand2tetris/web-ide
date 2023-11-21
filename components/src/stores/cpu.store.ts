import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { Ok, isErr } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  KeyboardAdapter,
  MemoryAdapter,
  MemoryKeyboard,
  ROM,
  SubMemory,
} from "@nand2tetris/simulator/cpu/memory.js";
import { Span } from "@nand2tetris/simulator/languages/base.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { HACK } from "@nand2tetris/simulator/testing/mult.js";
import { CPUTest } from "@nand2tetris/simulator/tst.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { compare } from "../compare.js";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

function makeTst() {
  return `repeat {
  ticktock;
}`;
}

export interface CpuSim {
  A: number;
  D: number;
  PC: number;
  RAM: MemoryAdapter;
  ROM: MemoryAdapter;
  Screen: MemoryAdapter;
  Keyboard: KeyboardAdapter;
}

export interface CPUTestSim {
  tst: string;
  cmp: string;
  out: string;
  highlight: Span | undefined;
}

export interface CpuPageState {
  sim: CpuSim;
  test: CPUTestSim;
}

class ImmMemory extends SubMemory {
  constructor(
    parent: MemoryAdapter,
    private dispatch: MutableRefObject<CpuStoreDispatch>
  ) {
    super(parent, parent.size, 0);
  }

  override async load(fs: FileSystem, path: string): Promise<void> {
    await super.load(fs, path);
    this.dispatch.current({ action: "update" });
  }
}

function reduceCPUTest(
  cpuTest: CPUTest,
  dispatch: MutableRefObject<CpuStoreDispatch>
): CpuSim {
  const RAM = new ImmMemory(cpuTest.cpu.RAM, dispatch);
  const ROM = new ImmMemory(cpuTest.cpu.ROM, dispatch);
  const Screen = new ImmMemory(cpuTest.cpu.Screen, dispatch);
  const Keyboard = new MemoryKeyboard(new ImmMemory(cpuTest.cpu.RAM, dispatch));

  return {
    A: cpuTest.cpu.A,
    D: cpuTest.cpu.D,
    PC: cpuTest.cpu.PC,
    RAM,
    ROM,
    Screen,
    Keyboard,
  };
}

export type CpuStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeCpuStore>["reducers"];
  payload?: unknown;
}>;

export function makeCpuStore(
  fs: FileSystem,
  setStatus: (status: string) => void,
  storage: Record<string, string>,
  dispatch: MutableRefObject<CpuStoreDispatch>
) {
  let test = new CPUTest(new ROM(HACK));

  const reducers = {
    update(state: CpuPageState) {
      state.sim = reduceCPUTest(test, dispatch);
      state.test.highlight = test.currentStep?.span;
    },

    setTest(state: CpuPageState, { tst, cmp }: { tst?: string; cmp?: string }) {
      state.test.tst = tst ?? state.test.tst;
      state.test.cmp = cmp ?? state.test.cmp;
      state.test.out = "";
    },

    testStep(state: CpuPageState) {
      state.test.out = test.log();
      this.update(state);
    },

    testFinished(state: CpuPageState) {
      const passed = compare(state.test.cmp.trim(), test.log().trim());
      setStatus(
        passed
          ? `Simulation successful: The output file is identical to the compare file`
          : `Simulation error: The output file differs from the compare file`
      );
    },
  };

  const actions = {
    tick() {
      test.cpu.tick();
    },

    testStep() {
      const done = test.step();
      dispatch.current({ action: "testStep" });
      if (done) {
        dispatch.current({ action: "testFinished" });
      }
    },

    resetRAM() {
      // test.cpu.RAM.set(0, 3);
      // test.cpu.RAM.set(1, 2);
      test.cpu.RAM.loadBytes([]);
      dispatch.current({ action: "update" });
      setStatus("Reset RAM");
    },

    toggleUseTest() {
      dispatch.current({ action: "update" });
    },

    resetCPU() {
      test.reset();
      dispatch.current({ action: "setTest", payload: {} });
      dispatch.current({ action: "update" });
      setStatus("Reset CPU");
    },

    reset() {
      this.resetCPU();
      setStatus("Reset CPU & RAM");
    },

    compileTest(file: string, cmp?: string) {
      dispatch.current({ action: "setTest", payload: { tst: file, cmp } });
      const tst = TST.parse(file);

      if (isErr(tst)) {
        setStatus(`Failed to parse test`);
        return false;
      }
      setStatus(`Parsed tst`);

      test = CPUTest.from(Ok(tst), test.cpu.ROM);
      dispatch.current({ action: "update" });
      return true;
    },

    initialize() {
      this.compileTest(makeTst());
    },
  };

  const initialState = {
    sim: reduceCPUTest(test, dispatch),
    test: {
      highlight: test.currentStep?.span,
      tst: "",
      cmp: "",
      out: "",
    },
  };

  return { initialState, reducers, actions };
}

export function useCpuPageStore() {
  const { fs, setStatus, storage } = useContext(BaseContext);

  const dispatch = useRef<CpuStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeCpuStore(fs, setStatus, storage, dispatch),
    [fs, setStatus, storage, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
