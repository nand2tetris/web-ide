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
  fs?: FileSystem;
  files: Record<string, string>;
  compiled: Record<string, CompiledFile>;
  isValid: boolean;
  isCompiled: boolean;
  selected: string;
  title?: string;
}

export type CompilerStoreDispatch = Dispatch<{
  action: keyof ReturnType<typeof makeCompilerStore>["reducers"];
  payload?: unknown;
}>;

function classTemplate(name: string) {
  return `class ${name} {\n\n}\n`;
}

export function makeCompilerStore(
  setStatus: (status: string) => void,
  dispatch: MutableRefObject<CompilerStoreDispatch>,
) {
  let fs: FileSystem | undefined;

  const reducers = {
    setFs(state: CompilerPageState, fs: FileSystem) {
      state.fs = fs;
    },
    reset(state: CompilerPageState) {
      state.files = {};
      state.title = undefined;
    },

    setFile(
      state: CompilerPageState,
      { name, content }: { name: string; content: string },
    ) {
      state.files[name] = content;
      state.isCompiled = false;
      this.compile(state);
    },

    // the keys of 'files' have to be the full file path, not basename
    setFiles(state: CompilerPageState, files: Record<string, string>) {
      state.files = files;
      state.isCompiled = false;
      this.compile(state);
    },

    compile(state: CompilerPageState) {
      const compiledFiles = compile(state.files);
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
      state.isValid =
        Object.keys(state.files).length == 0 ||
        Object.keys(state.files)
          .map((file) => state.compiled[file].valid)
          .reduce((a, b) => a && b, true);
    },

    writeCompiled(state: CompilerPageState) {
      if (Object.values(state.compiled).every((compiled) => compiled.valid)) {
        for (const [name, compiled] of Object.entries(state.compiled)) {
          if (compiled.vm) {
            fs?.writeFile(`${name}.vm`, compiled.vm);
          }
        }
      }
      state.isCompiled = true;
    },

    setSelected(state: CompilerPageState, selected: string) {
      state.selected = selected;
    },

    setTitle(state: CompilerPageState, title: string) {
      state.title = title;
    },
  };

  const actions = {
    async loadProject(_fs: FileSystem) {
      this.reset();
      fs = _fs;
      dispatch.current({ action: "setFs", payload: fs });

      const files: Record<string, string> = {};
      for (const file of (await fs.scandir("/")).filter(
        (entry) => entry.isFile() && entry.name.endsWith(".jack"),
      )) {
        files[file.name.replace(".jack", "")] = await fs.readFile(file.name);
      }
      this.loadFiles(files);
    },

    async loadFiles(files: Record<string, string>) {
      dispatch.current({ action: "setFiles", payload: files });
      if (Object.entries(files).length > 0) {
        dispatch.current({
          action: "setSelected",
          payload: Object.keys(files)[0],
        });
      }
    },

    async writeFile(name: string, content?: string) {
      content ??= classTemplate(name);
      dispatch.current({ action: "setFile", payload: { name, content } });
      if (fs) {
        await fs.writeFile(`${name}.jack`, content);
      }
    },

    async reset() {
      fs = undefined;
      dispatch.current({ action: "reset" });
    },

    async compile() {
      dispatch.current({ action: "writeCompiled" });
    },
  };

  const initialState: CompilerPageState = {
    files: {},
    compiled: {},
    selected: "",
    isCompiled: false,
    isValid: true,
  };

  return { initialState, reducers, actions };
}

export function useCompilerPageStore() {
  const { setStatus } = useContext(BaseContext);

  const dispatch = useRef<CompilerStoreDispatch>(() => undefined);

  const { initialState, reducers, actions } = useMemo(
    () => makeCompilerStore(setStatus, dispatch),
    [setStatus, dispatch],
  );

  const [state, dispatcher] = useImmerReducer(reducers, initialState);
  dispatch.current = dispatcher;

  return { state, dispatch, actions };
}
