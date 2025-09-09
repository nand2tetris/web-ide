import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { useDialog } from "@nand2tetris/components/dialog.js";
import { createContext, useCallback, useState } from "react";
import { useFilePicker } from "./shell/file_select";
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

export function useAppContext(_fs: FileSystem = new FileSystem()) {
  const [theme, setTheme] = useState<Theme>("system");

  return {
    monaco: useMonaco(),
    settings: useDialog(),
    filePicker: useFilePicker(),
    tracking: useTracking(),
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
});
