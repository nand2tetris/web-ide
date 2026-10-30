import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import {
  Diagnostic,
  Diagnostics,
  diagnostic,
} from "@nand2tetris/simulator/languages/base.js";
import { Action } from "@nand2tetris/simulator/types.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext, type StatusInput } from "./base.context.js";

export interface CompiledFile {
  vm?: string;
  valid: boolean;
  diagnostics: readonly Diagnostic[];
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

const COMPILE_DEBOUNCE_MS = 250;

/** The class a Jack file declares: the file's name without its folder and extension. */
function classNameOf(path: string): string {
  return (path.split("/").pop() ?? path).replace(/\.jack$/, "");
}

/**
 * Compiles files keyed by editor path. `compile` keys files by class name, so
 * each path goes in by its basename and its result comes back under the path.
 */
function compileByPath(
  files: Record<string, string>,
  attemptRecovery: boolean,
): Record<string, string | Diagnostics> {
  const paths: Record<string, string> = {};
  const byClass: Record<string, string> = {};
  const duplicates: Record<string, Diagnostics> = {};
  for (const [path, content] of Object.entries(files)) {
    const name = classNameOf(path);
    if (name in byClass) {
      duplicates[path] = [
        diagnostic("jack.duplicateClassFile", { path, other: paths[name] }),
      ];
      continue;
    }
    paths[name] = path;
    byClass[name] = content;
  }
  const compiled = compile(byClass, { attemptRecovery });
  return {
    ...Object.fromEntries(
      Object.entries(compiled).map(([name, result]) => [paths[name], result]),
    ),
    ...duplicates,
  };
}

function classTemplate(name: string) {
  return `class ${name} {\n\n}\n`;
}

export function makeCompilerStore(
  setStatus: Action<StatusInput>,
  dispatch: MutableRefObject<CompilerStoreDispatch>,
  attemptRecovery: () => boolean = () => true,
) {
  let fs: FileSystem | undefined;
  let compileTimer: ReturnType<typeof setTimeout> | undefined;
  // Disk writes are chained so the latest content always lands last.
  let pendingWrite: Promise<unknown> = Promise.resolve();

  const flushCompile = () => {
    if (compileTimer !== undefined) {
      clearTimeout(compileTimer);
      compileTimer = undefined;
      dispatch.current({ action: "compile" });
    }
  };

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
      const isNew = !(name in state.files);
      state.files[name] = content;
      state.isCompiled = false;
      // Recompiling every file per keystroke is too slow for large projects;
      // actions.writeFile schedules a debounced compile for edits.
      if (isNew) {
        this.compile(state);
      }
    },

    setFiles(state: CompilerPageState, files: Record<string, string>) {
      state.files = files;
      state.isCompiled = false;
      this.compile(state);
    },

    compile(state: CompilerPageState) {
      const compiledFiles = compileByPath(state.files, attemptRecovery());
      state.compiled = {};
      for (const [name, compiled] of Object.entries(compiledFiles)) {
        if (typeof compiled === "string") {
          state.compiled[name] = {
            valid: true,
            vm: compiled,
            diagnostics: [],
          };
        } else {
          state.compiled[name] = {
            valid: false,
            diagnostics: compiled,
          };
        }
      }
      state.isValid = Object.keys(state.files).every(
        (file) => state.compiled[file].valid,
      );
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
      clearTimeout(compileTimer);
      compileTimer = setTimeout(flushCompile, COMPILE_DEBOUNCE_MS);
      if (fs) {
        const target = fs;
        const write = pendingWrite.then(() =>
          target.writeFile(`${name}.jack`, content),
        );
        pendingWrite = write.catch(() => undefined);
        await write;
      }
    },

    async reset() {
      clearTimeout(compileTimer);
      compileTimer = undefined;
      fs = undefined;
      dispatch.current({ action: "reset" });
    },

    async compile() {
      flushCompile();
      dispatch.current({ action: "writeCompiled" });
    },

    /** Recompiles the loaded files with the current settings. */
    recompile() {
      clearTimeout(compileTimer);
      compileTimer = undefined;
      dispatch.current({ action: "compile" });
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
