import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { compile, validate } from "@nand2tetris/simulator/jack/compiler.js";
import { CompilationError } from "@nand2tetris/simulator/languages/base.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";
import { Action } from "@nand2tetris/simulator/types.js";

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
interface FileEntry {
  name: string;
  content: string;
}
export function makeCompilerStore(
  setStatus: Action<string>,
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

    setFile(state: CompilerPageState, { name, content }: FileEntry) {
      state.files[name] = content;
      state.isCompiled = false;
    },

    setFileAndValidate(state: CompilerPageState, entry: FileEntry) {
      this.setFile(state, entry);
      this.validate(state);
    },

    // the keys of 'files' have to be the full file path, not basename
    setFiles(state: CompilerPageState, files: Record<string, string>) {
      state.files = files;
      state.isCompiled = false;
      this.compile(state);
    },

    _processCompilationResults(
      state: CompilerPageState,
      files: Record<string, string | CompilationError>,
    ) {
      state.compiled = {};
      for (const [name, compiled] of Object.entries(files)) {
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
      state.isValid = Object.keys(state.files).every(
        (file) => state.compiled[file].valid,
      );
    },
    
    validate(state: CompilerPageState) {
      state.isCompiled = false;
      this._processCompilationResults(state, validate(state.files));
    },

    compile(state: CompilerPageState) {
      state.isCompiled = false;
      this._processCompilationResults(state, compile(state.files));
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
    async loadProject(_fs: FileSystem, title: string) {
      this.reset();
      fs = _fs;
      dispatch.current({ action: "setFs", payload: fs });
      dispatch.current({ action: "setTitle", payload: title });

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
    async writeNewFile(name: string, content?: string) {
      content ??= classTemplate(name);
      dispatch.current({
        action: "setFileAndValidate",
        payload: { name, content },
      });
      if (fs) {
        await fs.writeFile(`${name}.jack`, content);
      }
    },

    async reset() {
      fs = undefined;
      dispatch.current({ action: "reset" });
    },

    async compile() {
      dispatch.current({ action: "compile" });
      dispatch.current({ action: "writeCompiled" });
    },
    async validate() {
      dispatch.current({ action: "validate" });
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
