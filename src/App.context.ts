import { createContext } from "react";
import { Subject } from "rxjs";
import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs";

export function makeAppContext(fs: FileSystem) {
  const open = new Subject<void>();
  const statusLine = new Subject<string>();
  const setStatus = (status: string) => statusLine.next(status);
  return {
    fs,
    settings: { open },
    statusLine,
    setStatus,
  };
}

export const AppContext = createContext<{
  fs: FileSystem;
  settings: { open: Subject<void> };
  statusLine: Subject<string>;
  setStatus: (line: string) => void;
}>(makeAppContext(new FileSystem()));
