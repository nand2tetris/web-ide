import {
  FileSystem,
  FileSystemAdapter,
  LocalStorageFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ChainedFileSystemAdapter,
  FileSystemAccessFileSystemAdapter,
} from "./base/fs.js";
import {
  attemptLoadAdapterFromIndexedDb,
  createAndStoreLocalAdapterInIndexedDB,
} from "./base/indexDb.js";

export interface BaseContext {
  fs: FileSystem;
  upgradeFs: () => void;
  upgraded?: string;
  status: string;
  setStatus: (status: string) => void;
  storage: Record<string, string>;
}

export function useBaseContext(): BaseContext {
  const localAdapter = useMemo(() => new LocalStorageFileSystemAdapter(), []);
  const [fs, setFs] = useState(new FileSystem(localAdapter));
  const [upgraded, setUpgraded] = useState<string | undefined>();

  const replaceFs = useCallback(
    (handle: FileSystemDirectoryHandle) => {
      const newFs = new FileSystem(
        new ChainedFileSystemAdapter(
          new FileSystemAccessFileSystemAdapter(handle),
          localAdapter
        )
      );
      newFs.cd(fs.cwd());
      setFs(newFs);
      setUpgraded(handle.name);
    },
    [setFs, setUpgraded]
  );

  useEffect(() => {
    if (upgraded) return;
    attemptLoadAdapterFromIndexedDb().then((adapter) => {
      if (!adapter) return;
      replaceFs(adapter);
    });
  }, [upgraded, replaceFs]);

  const upgradeFs = useCallback(
    async (force = false) => {
      if (upgraded && !force) return;
      const adapter = await createAndStoreLocalAdapterInIndexedDB();
      replaceFs(adapter);
    },
    [replaceFs]
  );

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
  status: "",
  setStatus() {},
  storage: {},
});
