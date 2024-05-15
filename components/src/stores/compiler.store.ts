import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Err, isErr } from "@davidsouther/jiffies/lib/esm/result.js";
import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import { CompilationError } from "@nand2tetris/simulator/languages/base.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

export interface FileData {
  content: string;
  valid: boolean;
  error?: CompilationError;
}

export interface CompilerPageState {
  files: Record<string, FileData>;
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
    setFile(
      state: CompilerPageState,
      {
        name,
        content,
      }: {
        name: string;
        content?: string;
      }
    ) {
      content ??= "";
      const compiled = compile(content);

      state.files[name] = {
        content: content,
        valid: !isErr(compiled),
        error: isErr(compiled) ? Err(compiled) : undefined,
      };
    },

    setSelected(state: CompilerPageState, selected: string) {
      state.selected = selected;
    },
  };

  const actions = {
    async loadFiles(files: Record<string, string>) {
      this.reset();
      for (const [name, content] of Object.entries(files)) {
        dispatch.current({ action: "setFile", payload: { name, content } });
        dispatch.current({ action: "setSelected", payload: name });
      }
    },

    async reset() {
      dispatch.current({ action: "reset" });
    },
  };

  const initialState: CompilerPageState = {
    files: {},
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
