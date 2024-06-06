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

export function useToolStates() {
  const [rom, setRom] = useState<ROM>();
  const [cpuFile, setCpuFile] = useState<string | LocalFile>();
  const [cpuFormat, setCpuFormat] = useState<Format>("asm");

  const setCpuState = (
    file: string | LocalFile | undefined,
    rom: ROM | undefined,
    format: Format,
  ) => {
    setCpuFile(file);
    setRom(rom);
    setCpuFormat(format);
  };

  const [asmState, setAsmState] = useState<AsmPageState>();

  const [vmTitle, setVmTitle] = useState<string>();
  const [vmFiles, setVmFiles] = useState<VmFile[]>();

  const [jackTitle, setJackTitle] = useState<string>();
  const [jackFs, setJackFs] = useState<FileSystem>();
  const [jackCompiled, setJackCompiled] = useState(false);

  return {
    cpuState: { rom: rom, file: cpuFile, format: cpuFormat },
    setCpuState,
    asmState,
    setAsmState,
    vm: {
      files: vmFiles,
      title: vmTitle,
      setFiles: setVmFiles,
      setTitle: setVmTitle,
    },
    compiler: {
      title: jackTitle,
      setTitle: setJackTitle,
      fs: jackFs,
      setFs: setJackFs,
      compiled: jackCompiled,
      setCompiled: setJackCompiled,
      reset: () => {
        setJackTitle(undefined);
        setJackFs(undefined);
        setJackCompiled(false);
      },
    },
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
    cpuState: { rom: undefined, file: undefined, format: "asm" },
    setCpuState() {
      return undefined;
    },
    asmState: {
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
      compareError: false,
    },
    setAsmState() {
      return undefined;
    },
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
