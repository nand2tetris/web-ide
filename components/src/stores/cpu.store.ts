import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import {
  KeyboardAdapter,
  MemoryAdapter,
  MemoryKeyboard,
  ROM,
  SubMemory,
} from "@nand2tetris/simulator/cpu/memory.js";
import { HACK } from "@nand2tetris/simulator/testing/mult.js";
import { CPUTest } from "@nand2tetris/simulator/tst.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

export interface CpuSim {
  A: number;
  D: number;
  PC: number;
  RAM: MemoryAdapter;
  ROM: MemoryAdapter;
  Screen: MemoryAdapter;
  Keyboard: KeyboardAdapter;
}

export interface CpuPageState {
  sim: CpuSim;
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
  const test = new CPUTest(new ROM(HACK));

  const reducers = {
    update(state: CpuPageState) {
      state.sim = reduceCPUTest(test, dispatch);
    },
  };

  const actions = {
    tick() {
      test.cpu.tick();
    },

    resetRAM() {
      test.cpu.RAM.set(0, 3);
      test.cpu.RAM.set(1, 2);
      dispatch.current({ action: "update" });
      setStatus("Reset RAM");
    },

    resetCPU() {
      test.reset();
      dispatch.current({ action: "update" });
      setStatus("Reset CPU");
    },

    reset() {
      this.resetRAM();
      this.resetCPU();
      setStatus("Reset CPU & RAM");
    },
  };

  const initialState = {
    sim: reduceCPUTest(test, dispatch),
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
