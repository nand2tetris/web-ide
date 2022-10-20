import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { createContext, useState } from "react";

export interface BaseContext {
  fs: FileSystem;
  status: string;
  setStatus: (status: string) => void;
  storage: Record<string, string>;
}

export function useBaseContext(fs: FileSystem = new FileSystem()): BaseContext {
  const [status, setStatus] = useState("");

  return {
    fs,
    status,
    setStatus,
    storage: localStorage,
  };
}

export const BaseContext = createContext<BaseContext>({
  fs: new FileSystem(),
  status: "",
  setStatus: () => undefined,
  storage: {},
});
