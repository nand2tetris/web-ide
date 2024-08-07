import {
  FileSystem,
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
  openNand2TetrisDirectory,
} from "./base/fs.js";
import {
  attemptLoadAdapterFromIndexedDb,
  createAndStoreLocalAdapterInIndexedDB,
  removeLocalAdapterFromIndexedDB,
} from "./base/indexDb.js";
import { Action } from "@nand2tetris/simulator/types.js";

export interface BaseContext {
  fs: FileSystem;
  canUpgradeFs: boolean;
  upgradeFs: (force?: boolean) => void;
  closeFs: () => void;
  upgraded?: string;
  status: string;
  setStatus: Action<string>;
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
          localAdapter,
        ),
      );
      newFs.cd(fs.cwd());
      setFs(newFs);
      setUpgraded(handle.name);
    },
    [setFs, setUpgraded],
  );

  useEffect(() => {
    if (upgraded) return;
    attemptLoadAdapterFromIndexedDb().then((adapter) => {
      if (!adapter) return;
      replaceFs(adapter);
    });
  }, [upgraded, replaceFs]);

  const canUpgradeFs = `showDirectoryPicker` in window;
  const upgradeFs = useCallback(
    async (force = false) => {
      if (!canUpgradeFs || (upgraded && !force)) return;
      const handler = await openNand2TetrisDirectory();
      const adapter = await createAndStoreLocalAdapterInIndexedDB(handler);
      replaceFs(adapter);
    },
    [upgraded, replaceFs],
  );

  const closeFs = useCallback(async () => {
    if (!upgraded) return;
    await removeLocalAdapterFromIndexedDB();
    setFs(new FileSystem(localAdapter));
    setUpgraded(undefined);
  }, [upgraded, localAdapter]);

  const [status, setStatus] = useState("");

  return {
    fs,
    status,
    setStatus,
    storage: localStorage,
    canUpgradeFs,
    upgradeFs,
    closeFs,
    upgraded,
  };
}

export const BaseContext = createContext<BaseContext>({
  fs: new FileSystem(new LocalStorageFileSystemAdapter()),
  canUpgradeFs: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  upgradeFs() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeFs() {},
  status: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setStatus() {},
  storage: {},
});
