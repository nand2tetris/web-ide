import { Err, Ok, isErr } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  ASM,
  Asm,
  fillLabel,
  translateInstruction,
} from "@nand2tetris/simulator/languages/asm.js";
import { Span } from "@nand2tetris/simulator/languages/base.js";
import { bin } from "@nand2tetris/simulator/util/twos.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

export interface AsmPageState {
  asm: string;
  current: number;
  resultHighlight: Span | undefined;
  sourceHighlight: Span | undefined;
  symbols: [string, number][];
  result: string;
  compare: string;
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

  const highlightMap: Map<Span, Span> = new Map();

  const reducers = {
    setAsm(state: AsmPageState, { asm }: { asm: string }) {
      state.asm = asm;
      const parseResult = ASM.parse(asm);
      if (isErr(parseResult)) {
        setStatus(`Error parsing asm file - ${Err(parseResult).message}`);
        return;
      }
      state.symbols = [];
      asmInstructions = Ok(parseResult);
      fillLabel(asmInstructions, (name, value) => {
        state.symbols.push([name, value]);
      });
      asmInstructions.instructions = asmInstructions.instructions.filter(
        (instruction) => instruction.type !== "L"
      );
      this.reset(state);
      setStatus("Loaded asm file");
    },

    setCmp(state: AsmPageState, { cmp }: { cmp: string }) {
      state.compare = cmp;
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
      const instruction = asmInstructions.instructions[state.current];
      if (instruction.type === "A" || instruction.type === "C") {
        state.sourceHighlight = instruction.span;
        const result = translateInstruction(
          asmInstructions.instructions[state.current]
        );
        if (result === undefined) {
          return;
        }
        state.result += `${bin(result)}\n`;
        state.resultHighlight = {
          start: state.current * 17,
          end: (state.current + 1) * 17,
        };

        highlightMap.set(instruction.span, state.resultHighlight);
        if (state.current === asmInstructions.instructions.length - 1) {
          setStatus("Translation done.");
          done = true;
        }
      }
    },

    reset(state: AsmPageState) {
      state.result = "";
      state.current = -1;
      state.sourceHighlight = undefined;
      done = false;
      highlightMap.clear();
    },

    updateHighlight(
      state: AsmPageState,
      { index, fromSource }: { index: number; fromSource: boolean }
    ) {
      for (const [sourceSpan, resultSpan] of highlightMap) {
        if (
          (fromSource &&
            sourceSpan.start <= index &&
            index <= sourceSpan.end) ||
          (!fromSource && resultSpan.start <= index && index <= resultSpan.end)
        ) {
          state.sourceHighlight = sourceSpan;
          state.resultHighlight = resultSpan;
        }
      }
    },

    compare(state: AsmPageState) {
      if (state.result !== state.compare) {
        setStatus("Comparison failed");
        return;
      }
      setStatus("Comparison successful");
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
    resultHighlight: undefined,
    sourceHighlight: undefined,
    symbols: [],
    result: "",
    compare: "",
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
