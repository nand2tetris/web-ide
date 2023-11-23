import { Err, Ok, isErr } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  ASM,
  Asm,
  AsmAInstruction,
  AsmCInstruction,
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
  current: number;
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

  let instructionToIndex: Map<AsmAInstruction | AsmCInstruction, number> =
    new Map();

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
        state.current >= asmInstructions.instructions.length - 1
      ) {
        return;
      }
      state.current++;
      while (asmInstructions.instructions[state.current].type === "L") {
        state.current++;
      }
      const instruction = asmInstructions.instructions[state.current];
      if (instruction.type === "A" || instruction.type === "C") {
        state.highlight = instruction.span;
        const result = translateInstruction(
          asmInstructions.instructions[state.current]
        );
        if (result === undefined) {
          return;
        }
        state.result.push(bin(result));
        instructionToIndex.set(instruction, state.current);
        if (state.current === asmInstructions.instructions.length - 1) {
          setStatus("Translation done.");
          done = true;
        }
      }
    },

    reset(state: AsmPageState) {
      state.result = [];
      state.current = -1;
      state.highlight = undefined;
      done = false;
      instructionToIndex = new Map();
    },

    updateHighlightByTextOffset(state: AsmPageState, { index }: { index: number }) {
      if (!asmInstructions) {
        return;
      }
      for (const instruction of asmInstructions.instructions) {
        if (instruction.type === "A" || instruction.type === "C") {
          if (
            instruction.span.start <= index &&
            index <= instruction.span.end
          ) {
            state.highlight = instruction.span;
            const current = instructionToIndex.get(instruction);
            if (current !== undefined) {
              state.current = current;
            }
          }
        }
      }
    },

    updateHighlightByResult(state: AsmPageState, { index }: { index: number }) {
      state.current = index;
      for (const [instruction, i] of instructionToIndex) {
        if (i === index) {
          state.highlight = instruction.span;
          return;
        }
      }
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
    current: -1,
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
