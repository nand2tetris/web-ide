import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Err, isErr } from "@davidsouther/jiffies/lib/esm/result.js";
import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import { CompilationError } from "@nand2tetris/simulator/languages/base.js";
import { Dispatch, MutableRefObject, useContext, useMemo, useRef } from "react";
import { useImmerReducer } from "../react.js";
import { BaseContext } from "./base.context.js";

function deleteFile(path: string) {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith(path)) {
      localStorage.removeItem(key);
    }
  }
}

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

    deleteFile(state: CompilerPageState, name: string) {
      delete state.files[name];
    },

    copyFile(
      state: CompilerPageState,
      { oldName, newName }: { oldName: string; newName: string }
    ) {
      state.files[newName] = state.files[oldName];
    },

    setSelected(state: CompilerPageState, selected: string) {
      state.selected = selected;
    },
  };

  const actions = {
    async editFile(name: string, content: string) {
      dispatch.current({ action: "setFile", payload: { name, content } });
      await fs.writeFile(`/jack/${name}.jack`, content);
    },

    async addFile(name: string, content?: string) {
      dispatch.current({ action: "setFile", payload: { name, content } });
      await fs.writeFile(`/jack/${name}.jack`, content ?? "");
      dispatch.current({ action: "setSelected", payload: name });
    },

    async deleteFile(name: string) {
      dispatch.current({ action: "deleteFile", payload: name });
      // TODO: this should be done through the file system but currently that doesn't seem to work
      deleteFile(`/jack/${name}.jack`);
    },

    async reset() {
      for (const file of await fs.scandir("/jack")) {
        await this.deleteFile(file.name.replace(".jack", ""));
      }
    },

    async renameFile(oldName: string, newName: string) {
      dispatch.current({ action: "copyFile", payload: { oldName, newName } });
      const content = await fs.readFile(`/jack/${oldName}.jack`);
      await fs.writeFile(`/jack/${newName}.jack`, content);
      await this.deleteFile(oldName);
    },

    async _loadFiles() {
      const files = (await fs.scandir("/jack")).filter(
        (entry) => entry.isFile() && entry.name.endsWith(".jack")
      );
      for (const file of files) {
        dispatch.current({
          action: "setFile",
          payload: {
            name: file.name.replace(".jack", ""),
            content: await fs.readFile(`/jack/${file.name}`),
          },
        });
      }
      dispatch.current({
        action: "setSelected",
        payload: files[0].name.replace(".jack", ""),
      });
    },

    async initialize() {
      const files = await fs.scandir("/jack");
      if (files.length == 0) {
        fs.mkdir("/jack");
        fs.writeFile("/jack/Main.jack", "");
      }
      await this._loadFiles();
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
