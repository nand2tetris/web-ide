import { createContext, useCallback, useState } from "react";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

export function useSettings() {
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

  return {
    fs,
    status,
    setStatus,
    settings: useSettings(),
    monaco: useMonaco(),
  };
}

export const AppContext = createContext<ReturnType<typeof useAppContext>>({
  fs: new FileSystem(),
  status: "",
  setStatus: () => {},
  settings: {
    close() {},
    open() {},
    isOpen: false,
  },
  monaco: {
    canUse: true,
    wants: true,
    toggle() {},
  },
});
