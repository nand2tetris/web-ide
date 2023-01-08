import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { Clock } from "@nand2tetris/simulator/chip/clock";
import { CPU } from "@nand2tetris/simulator/cpu/cpu";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "src/react";
import { BaseContext } from "./base.context";

export interface CpuSim {
  A: number;
  D: number;
  PC: number;
}

export interface CpuPageState {
  sim: CpuSim;
}

function reduceCPU(cpu: CPU): CpuSim {
  return {
    A: cpu.A,
    D: cpu.D,
    PC: cpu.PC,
  };
}

const clock = Clock.get();

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
  const cpu = new CPU({});

  const reducers = {
    update(state: CpuPageState) {
      state.sim = reduceCPU(cpu);
    },
  };
  const actions = {
    tick() {
      cpu.tick();
      dispatch.current({ action: "update" });
    },
  };
  const initialState = {};

  return { initialState, reducers, actions };
}

export function useCpuPageStore() {
  const { fs, setStatus, storage } = useContext(BaseContext);

  const dispatch = useRef<CpuStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeCpuStore(fs, setStatus, storage, dispatch),
    [fs, setStatus, storage, dispatch]
  );

  const [state, dispatcher] = useImmerReducer<CpuPageState>(
    reducers,
    // reducers as unknown as Record<
    //   string,
    //   (state: CpuPageState, action?: unknown) => void
    // >,
    initialState
  );
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
