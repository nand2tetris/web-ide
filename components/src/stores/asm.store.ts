import { Err, Ok, isErr } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  ASM,
  Asm,
  fillLabel,
  translateInstruction,
} from "@nand2tetris/simulator/languages/asm.js";
import { Span } from "@nand2tetris/simulator/languages/base.js";
import { loadHackSync } from "@nand2tetris/simulator/loader.js";
import { bin } from "@nand2tetris/simulator/util/twos.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

export interface AsmPageState {
  asm: string;
  next: number;
  highlight: Span | undefined;
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
  let asmInstructions: Asm | null = null;
  let done = false;

  const reducers = {
    setAsm(state: AsmPageState, { asm }: { asm: string }) {
      state.asm = asm;
      const parseResult = ASM.parse(asm);
      if (isErr(parseResult)) {
        setStatus(`Error parsing asm file - ${Err(parseResult).message}`);
        return;
      }
      asmInstructions = Ok(parseResult);
      console.log(asmInstructions.lineMap);
      fillLabel(asmInstructions);
      this.reset(state);
      setStatus("Loaded asm file");
    },

    setCmp(state: AsmPageState, { cmp }: { cmp: string }) {
      state.compare = loadHackSync(cmp).map((n) => bin(n));
      setStatus("Loaded compare file");
    },

    step(state: AsmPageState) {
      if (
        !asmInstructions ||
        state.next >= asmInstructions.instructions.length
      ) {
        return;
      }
      while (asmInstructions.instructions[state.next].type === "L") {
        state.next++;
      }
      const instruction = asmInstructions.instructions[state.next];
      if (instruction.type === "A" || instruction.type === "C") {
        state.highlight = instruction.span;
      }
      const result = translateInstruction(
        asmInstructions.instructions[state.next]
      );
      if (result !== undefined) {
        state.result.push(bin(result));
        state.next++;
        if (state.next >= asmInstructions.instructions.length) {
          setStatus("Translation done.");
          done = true;
        }
      }
    },

    reset(state: AsmPageState) {
      state.result = [];
      state.next = 0;
      state.highlight = undefined;
      done = false;
    },
  };

  const actions = {
    step(): boolean {
      dispatch.current({ action: "step" });
      return done;
    },
  };

  const initialState = {
    asm: "",
    next: 0,
    highlight: undefined,
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
