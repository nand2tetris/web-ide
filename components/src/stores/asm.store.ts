import { Err, Ok, isErr } from "@davidsouther/jiffies/lib/esm/result.js";
import {
  KEYBOARD_OFFSET,
  SCREEN_OFFSET,
} from "@nand2tetris/simulator/cpu/memory.js";
import {
  ASM,
  Asm,
  fillLabel,
  isAValueInstruction,
  translateInstruction,
} from "@nand2tetris/simulator/languages/asm.js";
import { Span } from "@nand2tetris/simulator/languages/base.js";
import { bin } from "@nand2tetris/simulator/util/twos.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

function defaultSymbols(): [string, string][] {
  return [
    ["R0", "0"],
    ["R1", "1"],
    ["R2", "2"],
    ["...", ""],
    ["R15", "15"],
    ["SCREEN", SCREEN_OFFSET.toString()],
    ["KBD", KEYBOARD_OFFSET.toString()],
  ];
}

interface HighlightInfo {
  resultHighlight: Span | undefined;
  sourceHighlight: Span | undefined;
  highlightMap: Map<Span, Span>;
}

class Translator {
  asm: Asm | null = null;
  current = -1;
  done = false;
  symbols: [string, string][] = [];
  hiddenSymbols: Map<number, [string, boolean]> = new Map();
  result = "";

  load(asm: Asm) {
    this.symbols = defaultSymbols();
    this.hiddenSymbols.clear();
    this.asm = asm;
    fillLabel(asm, (name, value, isVar) => {
      if (isVar) {
        this.hiddenSymbols.set(value, [name, false]);
      } else {
        this.symbols.push([name, value.toString()]);
      }
    });
    asm.instructions = asm.instructions.filter(
      (instruction) => instruction.type !== "L"
    );

    this.reset();
  }

  step(highlightInfo: HighlightInfo) {
    if (this.asm === null || this.current >= this.asm.instructions.length - 1) {
      return;
    }
    this.current++;
    const instruction = this.asm.instructions[this.current];
    if (instruction.type === "A" || instruction.type === "C") {
      highlightInfo.sourceHighlight = instruction.span;
      const result = translateInstruction(this.asm.instructions[this.current]);
      if (result === undefined) {
        return;
      }
      this.result += `${bin(result)}\n`;
      highlightInfo.resultHighlight = {
        start: this.current * 17,
        end: (this.current + 1) * 17,
      };

      highlightInfo.highlightMap.set(
        instruction.span,
        highlightInfo.resultHighlight
      );

      if (instruction.type === "A" && isAValueInstruction(instruction)) {
        const variable = this.hiddenSymbols.get(instruction.value);
        if (variable != undefined && !variable[1]) {
          console.log("value", instruction.value, "name", variable[0]);
          this.symbols.push([variable[0], instruction.value.toString()]);
          console.log(this.symbols);
          this.hiddenSymbols.set(instruction.value, [variable[0], true]);
        }
      }

      if (this.current === this.asm.instructions.length - 1) {
        this.done = true;
      }
    }
  }

  resetSymbols() {
    const hiddenSymbolNames: Set<string> = new Set();
    for (const [value, variable] of this.hiddenSymbols) {
      hiddenSymbolNames.add(variable[0]);
      this.hiddenSymbols.set(value, [variable[0], false]);
    }

    this.symbols = this.symbols.filter(
      (symbol) => !hiddenSymbolNames.has(symbol[0])
    );
  }

  reset() {
    this.current = -1;
    this.result = "";
    this.done = false;
    this.resetSymbols();
  }
}

export interface AsmPageState {
  asm: string;
  current: number;
  resultHighlight: Span | undefined;
  sourceHighlight: Span | undefined;
  symbols: [string, string][];
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
  const translator = new Translator();
  const highlightInfo = {
    resultHighlight: undefined,
    sourceHighlight: undefined,
    highlightMap: new Map(),
  };

  const reducers = {
    setAsm(state: AsmPageState, { asm }: { asm: string }) {
      state.asm = asm;
    },

    setCmp(state: AsmPageState, { cmp }: { cmp: string }) {
      state.compare = cmp;
      setStatus("Loaded compare file");
    },

    update(state: AsmPageState) {
      state.current = translator.current;
      state.result = translator.result;
      state.symbols = Array.from(translator.symbols);
      state.sourceHighlight = highlightInfo.sourceHighlight;
      state.resultHighlight = highlightInfo.resultHighlight;
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
    loadAsm(asm: string) {
      dispatch.current({ action: "setAsm", payload: { asm } });

      const parseResult = ASM.parse(asm);
      if (isErr(parseResult)) {
        setStatus(`Error parsing asm file - ${Err(parseResult).message}`);
        return;
      }

      translator.load(Ok(parseResult));
      dispatch.current({ action: "update" });
      setStatus("Loaded asm file");
    },

    step(): boolean {
      translator.step(highlightInfo);
      dispatch.current({ action: "update" });
      if (translator.done) {
        setStatus("Translation done.");
      }
      return translator.done;
    },

    updateHighlight(index: number, fromSource: boolean) {
      for (const [sourceSpan, resultSpan] of highlightInfo.highlightMap) {
        if (
          (fromSource &&
            sourceSpan.start <= index &&
            index <= sourceSpan.end) ||
          (!fromSource && resultSpan.start <= index && index <= resultSpan.end)
        ) {
          highlightInfo.sourceHighlight = sourceSpan;
          highlightInfo.resultHighlight = resultSpan;
        }
      }
      dispatch.current({ action: "update" });
    },

    resetHighlightInfo() {
      highlightInfo.sourceHighlight = undefined;
      highlightInfo.resultHighlight = undefined;
      highlightInfo.highlightMap.clear();
    },

    reset() {
      translator.reset();
      this.resetHighlightInfo();
      dispatch.current({ action: "update" });
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
