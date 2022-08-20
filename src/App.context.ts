import { createContext, useCallback, useState } from "react";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

export type Theme = "light" | "dark" | "system";

export function useDialog() {
  const [open, setOpen] = useState(false);
  return {
    isOpen: open,
    open() {
      setOpen(true);
    },
    close() {
      setOpen(false);
    },
  };
}

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
    filePicker: useDialog(),
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
    isOpen: false,
  },
  settings: {
    close() {},
    open() {},
    isOpen: false,
  },
  theme: "system",
  setTheme() {},
});
