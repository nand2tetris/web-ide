import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { createContext, useState } from "react";

export function useBaseContext(fs: FileSystem = new FileSystem()) {
  const [status, setStatus] = useState("");

  return {
    fs,
    status,
    setStatus,
  };
}

export const BaseContext = createContext<ReturnType<typeof useBaseContext>>({
  fs: new FileSystem(),
  status: "",
  setStatus: () => undefined,
});
