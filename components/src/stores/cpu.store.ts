import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { CPU } from "@nand2tetris/simulator/cpu/cpu.js";
import {
  KeyboardAdapter,
  MemoryAdapter,
  MemoryKeyboard,
  ROM,
  SubMemory,
} from "@nand2tetris/simulator/cpu/memory.js";
import { HACK } from "@nand2tetris/simulator/testing/mult.js";
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

function reduceCPU(
  cpu: CPU,
  dispatch: MutableRefObject<CpuStoreDispatch>
): CpuSim {
  const RAM = new ImmMemory(cpu.RAM, dispatch);
  const ROM = new ImmMemory(cpu.ROM, dispatch);
  const Screen = new ImmMemory(cpu.Screen, dispatch);
  const Keyboard = new MemoryKeyboard(new ImmMemory(cpu.RAM, dispatch));

  return {
    A: cpu.A,
    D: cpu.D,
    PC: cpu.PC,
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
  const cpu = new CPU({ ROM: new ROM(HACK) });

  const reducers = {
    update(state: CpuPageState) {
      state.sim = reduceCPU(cpu, dispatch);
    },
  };

  const actions = {
    tick() {
      cpu.tick();
    },

    resetRAM() {
      cpu.RAM.set(0, 3);
      cpu.RAM.set(1, 2);
      dispatch.current({ action: "update" });
      setStatus("Reset RAM");
    },

    resetCPU() {
      cpu.reset();
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
    sim: reduceCPU(cpu, dispatch),
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
