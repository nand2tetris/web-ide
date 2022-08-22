import { createContext, useCallback, useState } from "react";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { useDialog } from "./components/shell/dialog";
import { useFilePicker } from "./components/shell/file_select";

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
  const [status, setStatus] = useState("");
  const [theme, setTheme] = useState<Theme>("system");

  return {
    fs,
    monaco: useMonaco(),
    status,
    setStatus,
    settings: useDialog(),
    filePicker: useFilePicker(),
    theme,
    setTheme,
  };
}

export const AppContext = createContext<ReturnType<typeof useAppContext>>({
  fs: new FileSystem(),
  monaco: {
    canUse: true,
    wants: true,
    toggle() {},
  },
  status: "",
  setStatus: () => {},
  filePicker: {
    close() {},
    open() {},
    select() {
      return Promise.reject("");
    },
    isOpen: false,
  } as ReturnType<typeof useFilePicker>,
  settings: {
    close() {},
    open() {},
    isOpen: false,
  },
  theme: "system",
  setTheme() {},
});
