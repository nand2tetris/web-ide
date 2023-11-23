import { loadHackSync } from "@nand2tetris/simulator/loader.js";
import { bin } from "@nand2tetris/simulator/util/twos.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

export interface AsmPageState {
  asm: string;
  result: string[];
  compare: string[];
}

export type AsmStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeAsmStore>["reducers"];
  payload?: unknown;
}>;

export function makeAsmStore(
  setStatus: (status: string) => void,
  dispatch: MutableRefObject<AsmStoreDispatch>
) {
  const reducers = {
    setAsm(state: AsmPageState, { asm }: { asm: string }) {
      state.asm = asm;
      setStatus("Loaded asm file");
    },

    setCmp(state: AsmPageState, { cmp }: { cmp: string }) {
      state.compare = loadHackSync(cmp).map((n) => bin(n));
      setStatus("Loaded compare file");
    },
  };

  const actions = {
    step() {
      // translate an instruction
    },
  };

  const initialState = {
    asm: "",
    result: [],
    compare: [],
  };

  return { initialState, reducers, actions };
}

export function useAsmPageStore() {
  const { setStatus } = useContext(BaseContext);

  const dispatch = useRef<AsmStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeAsmStore(setStatus, dispatch),
    [setStatus, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
