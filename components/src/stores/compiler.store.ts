import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import { CompilationError } from "@nand2tetris/simulator/languages/base.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

export interface CompiledFile {
  vm?: string;
  valid: boolean;
  error?: CompilationError;
}

export interface CompilerPageState {
  files: Record<string, string>;
  compiled: Record<string, CompiledFile>;
  selected: string;
}

export type CompilerStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeCompilerStore>["reducers"];
  payload?: unknown;
}>;

export function makeCompilerStore(
  fs: FileSystem,
  setStatus: (status: string) => void,
  dispatch: MutableRefObject<CompilerStoreDispatch>
) {
  const reducers = {
    reset(state: CompilerPageState) {
      state.files = {};
    },
    setFiles(state: CompilerPageState, files: Record<string, string>) {
      state.files = files;

      const compiledFiles = compile(files);
      state.compiled = {};
      for (const [name, compiled] of Object.entries(compiledFiles)) {
        if (typeof compiled === "string") {
          state.compiled[name] = {
            valid: true,
            vm: compiled,
          };
        } else {
          state.compiled[name] = {
            valid: false,
            error: compiled,
          };
        }
      }
    },

    setSelected(state: CompilerPageState, selected: string) {
      state.selected = selected;
    },
  };

  const actions = {
    async loadFiles(files: Record<string, string>) {
      this.reset();
      dispatch.current({ action: "setFiles", payload: files });
      if (Object.entries(files).length > 0) {
        dispatch.current({
          action: "setSelected",
          payload: Object.keys(files)[0],
        });
      }
    },

    async reset() {
      dispatch.current({ action: "reset" });
    },
  };

  const initialState: CompilerPageState = {
    files: {},
    compiled: {},
    selected: "",
  };

  return { initialState, reducers, actions };
}

export function useCompilerPageStore() {
  const { setStatus, fs } = useContext(BaseContext);

  const dispatch = useRef<CompilerStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeCompilerStore(fs, setStatus, dispatch),
    [setStatus, dispatch]
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
