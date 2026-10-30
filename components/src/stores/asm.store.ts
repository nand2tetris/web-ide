import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { Err, isErr, Ok } from "@davidsouther/jiffies/result.ts";
import {
  CompareResultLengths,
  CompareResultLine,
  compareLines,
} from "@nand2tetris/simulator/compare.js";
import {
  KEYBOARD_OFFSET,
  SCREEN_OFFSET,
} from "@nand2tetris/simulator/cpu/memory.js";
import {
  Asm,
  isAValueInstruction,
  resolveAsm,
  translateInstruction,
} from "@nand2tetris/simulator/languages/asm.js";
import {
  type Diagnostic,
  Span,
} from "@nand2tetris/simulator/languages/base.js";
import { Action } from "@nand2tetris/simulator/types.js";
import { bin } from "@nand2tetris/simulator/util/twos.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { RunSpeed } from "../runbar.js";
import { BaseContext, type StatusInput } from "./base.context.js";
import { failureStatus } from "./status.js";

export interface TranslatorSymbol {
  name: string;
  value: string;
}

function defaultSymbols(): TranslatorSymbol[] {
  return [
    { name: "R0", value: "0" },
    { name: "R1", value: "1" },
    { name: "R2", value: "2" },
    { name: "...", value: "" }, // abbreviation of R3 - R14
    { name: "R15", value: "15" },
    { name: "SCREEN", value: SCREEN_OFFSET.toString() },
    { name: "KBD", value: KEYBOARD_OFFSET.toString() },
  ];
}

interface HighlightInfo {
  resultHighlight: Span | undefined;
  sourceHighlight: Span | undefined;
  highlightMap: Map<Span, Span>;
}

interface AsmVariable {
  name: string;
  isHidden: boolean;
}

class Translator {
  asm: Asm = { instructions: [] };
  current = -1;
  done = false;
  symbols: TranslatorSymbol[] = [];
  private variables: Map<number, AsmVariable> = new Map();
  private lines: string[] = [];
  lineNumbers: number[] = [];

  getResult() {
    return this.lines.join("\n");
  }

  /**
   * Clears the last program's symbols, and gives the callback with which the
   * next `resolveAsm` reports the symbols that it defines.
   */
  beginLoad(): (name: string, value: number, isVar: boolean) => void {
    this.symbols = defaultSymbols();
    this.variables.clear();
    return (name, value, isVar) => {
      if (isVar) {
        this.variables.set(value, { name: name, isHidden: true });
      } else {
        this.symbols.push({ name: name, value: value.toString() });
      }
    };
  }

  /** Loads a program whose labels `resolveAsm` has resolved. */
  load(asm: Asm, lineNum: number) {
    this.asm = asm;
    asm.instructions = asm.instructions.filter(({ type }) => type !== "L");

    this.resolveLineNumbers(lineNum);
    this.reset();
  }

  resolveLineNumbers(lineNum: number) {
    this.lineNumbers = Array(lineNum);
    let currentLine = 0;
    for (const instruction of this.asm.instructions) {
      if (
        (instruction.type === "A" || instruction.type === "C") &&
        instruction.span != undefined
      ) {
        this.lineNumbers[instruction.span.line] = currentLine;
        currentLine += 1;
      }
    }
  }

  step(highlightInfo: HighlightInfo) {
    if (this.current >= this.asm.instructions.length - 1) {
      return;
    }
    this.current += 1;
    const instruction = this.asm.instructions[this.current];
    if (instruction.type === "A" || instruction.type === "C") {
      highlightInfo.sourceHighlight = instruction.span;
      const result = translateInstruction(this.asm.instructions[this.current]);
      if (result === undefined) {
        return;
      }
      this.lines.push(`${bin(result)}`);
      highlightInfo.resultHighlight = {
        start: this.current * 17,
        end: (this.current + 1) * 17,
        line: -1,
      };

      if (highlightInfo.sourceHighlight) {
        highlightInfo.highlightMap.set(
          highlightInfo.sourceHighlight,
          highlightInfo.resultHighlight,
        );
      }

      if (isAValueInstruction(instruction)) {
        const variable = this.variables.get(instruction.value);
        if (variable != undefined && variable.isHidden) {
          this.symbols.push({
            name: variable.name,
            value: instruction.value.toString(),
          });
          variable.isHidden = false;
        }
      }

      if (this.current === this.asm.instructions.length - 1) {
        this.done = true;
      }
    }
  }

  resetSymbols() {
    for (const variable of this.variables.values()) {
      variable.isHidden = true;
    }

    const variableNames = new Set(
      Array.from(this.variables.values()).map((v) => v.name),
    );
    this.symbols = this.symbols.filter(
      (symbol) => !variableNames.has(symbol.name),
    );
  }

  reset() {
    this.current = -1;
    this.lines = [];
    this.done = false;
    this.resetSymbols();
  }
}

export interface AsmPageState {
  asm: string;
  path: string | undefined;
  translating: boolean;
  current: number;
  resultHighlight: Span | undefined;
  sourceHighlight: Span | undefined;
  symbols: TranslatorSymbol[];
  result: string;
  compare: string;
  compareName: string | undefined;
  lineNumbers: number[];
  /** Every diagnostic of the last compile. */
  diagnostics: readonly Diagnostic[];
  compareError: boolean;
  title?: string;
  config: AsmPageConfig;
}

export interface AsmPageConfig {
  speed: RunSpeed;
}

export type AsmStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeAsmStore>["reducers"];
  payload?: unknown;
}>;

export function makeAsmStore(
  fs: FileSystem,
  setStatus: Action<StatusInput>,
  dispatch: MutableRefObject<AsmStoreDispatch>,
  upgraded: boolean,
  attemptRecovery: () => boolean = () => true,
) {
  const translator = new Translator();
  const highlightInfo: HighlightInfo = {
    resultHighlight: undefined,
    sourceHighlight: undefined,
    highlightMap: new Map(),
  };
  let path: string | undefined;
  let animate = true;
  let compiled = false;
  let translating = false;
  let failure = false;
  let source = "";

  /** Shows the diagnostics of ASM code that did not compile. */
  const compileFailed = (diagnostics: readonly Diagnostic[]) => {
    setStatus(failureStatus("ASM code", diagnostics, { head: true }));
    dispatch.current({ action: "setDiagnostics", payload: diagnostics });
    compiled = false;
  };

  const reducers = {
    setAsm(
      state: AsmPageState,
      { asm, path }: { asm: string; path: string | undefined },
    ) {
      state.asm = asm;

      if (path) {
        state.path = path;
      }
    },

    clearPath(state: AsmPageState) {
      state.path = undefined;
    },

    setCmp(state: AsmPageState, { cmp, name }: { cmp: string; name: string }) {
      state.compare = cmp;
      state.compareName = name;
      setStatus("Loaded compare file");
    },

    setDiagnostics(
      state: AsmPageState,
      diagnostics: readonly Diagnostic[] = [],
    ) {
      state.diagnostics = diagnostics;
    },

    update(state: AsmPageState) {
      state.translating = translating;
      state.current = translator.current;
      state.result = translator.getResult();
      state.symbols = Array.from(translator.symbols);
      state.lineNumbers = Array.from(translator.lineNumbers);
      state.sourceHighlight = highlightInfo.sourceHighlight;
      state.resultHighlight = highlightInfo.resultHighlight;
      state.compareError = failure;
    },

    compare(state: AsmPageState) {
      const comparison = compareLines(state.result, state.compare);

      if ((comparison as CompareResultLengths).lenA) {
        failure = true;
        setStatus({
          message: "Comparison failed - different lengths",
          severity: "ERROR",
        });
        return;
      }

      const { line } = comparison as CompareResultLine;
      if (line) {
        setStatus({
          message: `Comparison failure: Line ${line}`,
          severity: "ERROR",
        });

        failure = true;
        highlightInfo.resultHighlight = {
          start: line * 17,
          end: (line + 1) * 17,
          line: -1,
        };
        return;
      }

      setStatus({
        message: "Comparison successful",
        severity: "SUCCESS",
      });
    },

    setTitle(state: AsmPageState, title: string) {
      state.title = title;
    },

    updateConfig(state: AsmPageState, config: Partial<AsmPageConfig>) {
      state.config = { ...state.config, ...config };
    },
  };

  const actions = {
    // Without a path (an uploaded local file), clear the previous path so
    // edits and the translated .hack are not written over that file.
    async loadAsm(_path: string | undefined, content?: string) {
      path = _path;
      if (path === undefined) {
        dispatch.current({ action: "clearPath" });
      }
      const source = content ?? (path ? await fs.readFile(path) : "");
      actions.setAsm(source, path);
    },

    setAsm(asm: string, path?: string) {
      asm = asm.replace(/\r\n/g, "\n");
      source = asm;
      dispatch.current({
        action: "setAsm",
        payload: { asm, path },
      });
      translating = false;
      this.saveAsm(asm);
      requestAnimationFrame(() => {
        this.compileAsm(asm);
      });
    },

    saveAsm(asm: string) {
      if (path) {
        fs.writeFile(path, asm);
      }
    },

    compileAsm(asm: string) {
      this.reset();
      const loaded = resolveAsm(
        asm,
        { attemptRecovery: attemptRecovery() },
        translator.beginLoad(),
      );
      if (isErr(loaded)) {
        compileFailed(Err(loaded));
        return;
      }

      translator.load(Ok(loaded), asm.split("\n").length);

      compiled = translator.asm.instructions.length > 0;
      setStatus("");
      dispatch.current({ action: "setDiagnostics" });
      dispatch.current({ action: "update" });
    },

    /** Recompiles the source with the current settings. */
    recompile() {
      this.compileAsm(source);
    },

    setAnimate(value: boolean) {
      animate = value;
    },

    async step(): Promise<boolean> {
      if (compiled) {
        translating = true;
      }
      translator.step(highlightInfo);

      if (animate || translator.done) {
        dispatch.current({ action: "update" });

        if (path && upgraded) {
          await fs.writeFile(
            path.replace(/\.asm$/, ".hack"),
            translator.getResult(),
          );
        }
      }

      if (translator.done) {
        setStatus({
          message: "Translation done.",
          severity: "SUCCESS",
        });
      }
      return translator.done;
    },

    compare() {
      dispatch.current({ action: "compare" });
      this.updateHighlight(highlightInfo.resultHighlight?.start ?? 0, false);
      dispatch.current({ action: "update" });
    },

    updateHighlight(index: number, fromSource: boolean) {
      if (failure) {
        return;
      }
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
      failure = false;
      translating = false;
      setStatus("Reset");
      translator.reset();
      this.resetHighlightInfo();
      dispatch.current({ action: "update" });
    },

    clear() {
      this.setAsm("");
      dispatch.current({ action: "setTitle", payload: undefined });
      dispatch.current({ action: "setCmp", payload: "" });
      this.reset();
    },

    overrideState(state: AsmPageState) {
      this.resetHighlightInfo();
      this.setAsm(state.asm, state.path);
      dispatch.current({
        action: "setCmp",
        payload: { cmp: state.compare, name: state.compareName },
      });

      if (state.translating) {
        for (let i = 0; i <= state.current; i++) {
          this.step();
        }
      }

      dispatch.current({ action: "update" });
    },
  };

  const initialState: AsmPageState = {
    asm: "",
    path: undefined,
    translating: false,
    current: -1,
    resultHighlight: undefined,
    sourceHighlight: undefined,
    symbols: [],
    result: "",
    compare: "",
    compareName: undefined,
    lineNumbers: [],
    diagnostics: [],
    compareError: false,
    config: {
      speed: 2,
    },
  };

  return { initialState, reducers, actions };
}

export function useAsmPageStore() {
  const { setStatus, fs, localFsRoot } = useContext(BaseContext);

  const dispatch = useRef<AsmStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeAsmStore(fs, setStatus, dispatch, localFsRoot != undefined),
    [setStatus, dispatch, fs],
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
