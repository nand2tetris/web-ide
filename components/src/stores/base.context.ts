import {
  FileSystem,
  LocalStorageFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { createContext, useCallback, useMemo, useState } from "react";
import {
  ChainedFileSystemAdapter,
  FileSystemAccessFileSystemAdapter,
} from "./fs.js";

export interface BaseContext {
  fs: FileSystem;
  upgradeFs: () => void;
  upgraded: boolean;
  status: string;
  setStatus: (status: string) => void;
  storage: Record<string, string>;
}

export function useBaseContext(): BaseContext {
  const localAdapter = useMemo(() => new LocalStorageFileSystemAdapter(), []);
  const [fs, setFs] = useState(new FileSystem(localAdapter));
  const [upgraded, setUpgraded] = useState(false);

  const upgradeFs = useCallback(async () => {
    if (upgraded) return;
    const newFs = new FileSystem(
      new ChainedFileSystemAdapter(
        await FileSystemAccessFileSystemAdapter.initialize(),
        localAdapter
      )
    );
    newFs.cd(fs.cwd());
    setFs(newFs);
    setUpgraded(true);
  }, [fs, setFs]);

  const [status, setStatus] = useState("");

  return {
    fs,
    status,
    setStatus,
    storage: localStorage,
    upgradeFs,
    upgraded,
  };
}

export const BaseContext = createContext<BaseContext>({
  fs: new FileSystem(new LocalStorageFileSystemAdapter()),
  upgradeFs() {},
  upgraded: false,
  status: "",
  setStatus() {},
  storage: {},
});
