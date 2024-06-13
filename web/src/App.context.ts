import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { AsmPageState } from "@nand2tetris/components/stores/asm.store";
import { Format, ROM } from "@nand2tetris/simulator/cpu/memory";
import { VmFile } from "@nand2tetris/simulator/test/vmtst";
import { createContext, useCallback, useState } from "react";
import { useDialog } from "./shell/dialog";
import {
  FilePickerOptions,
  LocalFile,
  useFilePicker,
} from "./shell/file_select";
import { useTracking } from "./tracking";

export type Theme = "light" | "dark" | "system";

export function useMonaco() {
  const canUseMonaco = true;
  const [wantsMonaco, setWantsMonaco] = useState(canUseMonaco);
  const toggleMonaco = useCallback(
    (pleaseUseMonaco: boolean) => {
      if (canUseMonaco && pleaseUseMonaco) {
        setWantsMonaco(true);
      } else {
        setWantsMonaco(false);
      }
    },
    [canUseMonaco],
  );

  return {
    canUse: canUseMonaco,
    wants: wantsMonaco,
    toggle: toggleMonaco,
  };
}

export function useCpuState() {
  const [rom, setRom] = useState<ROM>();
  const [file, setFile] = useState<string | LocalFile>();
  const [format, setFormat] = useState<Format>("asm");

  const setState = (
    file: string | LocalFile | undefined,
    rom: ROM | undefined,
    format: Format,
  ) => {
    setFile(file);
    setRom(rom);
    setFormat(format);
  };

  return {
    rom,
    file,
    format,
    setState,
  };
}

export function useAsmState() {
  const [state, setState] = useState<AsmPageState>();

  return { state, setState };
}

export function useVmState() {
  const [title, setTitle] = useState<string>();
  const [files, setFiles] = useState<VmFile[] | string>();

  return {
    files,
    title,
    setFiles,
    setTitle,
  };
}

export function useCompilerState() {
  const [title, setTitle] = useState<string>();
  const [fs, setFs] = useState<FileSystem>();
  const [compiled, setCompiled] = useState(false);

  return {
    title,
    setTitle,
    fs,
    setFs,
    compiled,
    setCompiled,
    reset: () => {
      setTitle(undefined);
      setFs(undefined);
      setCompiled(false);
    },
  };
}

export function useToolStates() {
  return {
    cpu: useCpuState(),
    asm: useAsmState(),
    vm: useVmState(),
    compiler: useCompilerState(),
  };
}

export function useAppContext(fs: FileSystem = new FileSystem()) {
  const [theme, setTheme] = useState<Theme>("system");
  const [title, setTitle] = useState<string>();

  return {
    monaco: useMonaco(),
    settings: useDialog(),
    filePicker: useFilePicker(),
    tracking: useTracking(),
    theme,
    setTheme,
    toolStates: useToolStates(),
    title,
    setTitle,
  };
}

export const AppContext = createContext<ReturnType<typeof useAppContext>>({
  monaco: {
    canUse: true,
    wants: true,
    toggle() {
      return undefined;
    },
  },
  filePicker: {
    close() {
      return undefined;
    },
    open() {
      return undefined;
    },
    select(options: FilePickerOptions) {
      return Promise.reject("");
    },
    isOpen: false,
    suffix: undefined,
  } as ReturnType<typeof useFilePicker>,
  settings: {
    close() {
      return undefined;
    },
    open() {
      return undefined;
    },
    isOpen: false,
  },
  tracking: {
    canTrack: false,
    haveAsked: false,
    accept() {
      return undefined;
    },
    reject() {
      return undefined;
    },
    trackEvent() {
      return undefined;
    },
    trackPage() {
      return undefined;
    },
  },
  theme: "system",
  setTheme() {
    return undefined;
  },
  title: undefined,
  setTitle() {
    return undefined;
  },
  toolStates: {
    cpu: {
      rom: undefined,
      file: undefined,
      format: "asm",
      setState: () => undefined,
    },
    asm: { state: undefined, setState: () => undefined },
    vm: {
      files: undefined,
      title: undefined,
      setFiles: () => undefined,
      setTitle: () => undefined,
    },
    compiler: {
      title: undefined,
      setTitle: () => undefined,
      fs: undefined,
      setFs: () => undefined,
      compiled: false,
      setCompiled: () => false,
      reset: () => undefined,
    },
  },
});
