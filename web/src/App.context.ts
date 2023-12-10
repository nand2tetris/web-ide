import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { AsmPageState } from "@nand2tetris/components/stores/asm.store";
import { createContext, useCallback, useState } from "react";
import { useDialog } from "./shell/dialog";
import { useFilePicker } from "./shell/file_select";
import { TOOLS } from "./urls";
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
    [canUseMonaco]
  );

  return {
    canUse: canUseMonaco,
    wants: wantsMonaco,
    toggle: toggleMonaco,
  };
}

export function useToolStates() {
  const [tool, setTool] = useState<keyof typeof TOOLS>();

  const [rom, setRom] = useState<number[]>();
  const [cpuName, setCpuProgramName] = useState<string>();

  const [asmState, setAsmState] = useState<AsmPageState>();

  const setCpuState = (name: string | undefined, rom: number[] | undefined) => {
    setCpuProgramName(name);
    setRom(rom);
  };


  return {
    tool,
    setTool,
    cpuState: { rom: rom, name: cpuName },
    setCpuState,
    asmState,
    setAsmState,
  };
}

export function useAppContext(fs: FileSystem = new FileSystem()) {
  const [theme, setTheme] = useState<Theme>("system");

  return {
    monaco: useMonaco(),
    settings: useDialog(),
    filePicker: useFilePicker(),
    tracking: useTracking(),
    theme,
    setTheme,
    toolStates: useToolStates(),
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
    select() {
      return Promise.reject("");
    },
    isOpen: false,
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
  toolStates: {
    tool: undefined,
    setTool() {
      return undefined;
    },
    cpuState: { rom: undefined, name: undefined },
    setCpuState() {
      return undefined;
    },
    asmState: {
      asm: "",
      asmName: undefined,
      current: -1,
      resultHighlight: undefined,
      sourceHighlight: undefined,
      symbols: [],
      result: "",
      compare: "",
      compareName: undefined,
      lineNumbers: [],
    },
    setAsmState() {
      return undefined;
    },
  },
});
