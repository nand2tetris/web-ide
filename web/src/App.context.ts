import { createContext, useCallback, useState } from "react";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { useDialog } from "./shell/dialog";
import { useFilePicker } from "./shell/file_select";

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

export function useAppContext(fs: FileSystem = new FileSystem()) {
  const [theme, setTheme] = useState<Theme>("system");

  return {
    monaco: useMonaco(),
    settings: useDialog(),
    filePicker: useFilePicker(),
    theme,
    setTheme,
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
  theme: "system",
  setTheme() {
    return undefined;
  },
});
