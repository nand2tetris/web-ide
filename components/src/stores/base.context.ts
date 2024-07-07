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
  localFs?: FileSystem;
  localFsRoot?: string;
  canUpgradeFs: boolean;
  upgradeFs: (force?: boolean) => void;
  closeFs: () => void;
  status: string;
  setStatus: Action<string>;
  storage: Record<string, string>;
}

export function useBaseContext(): BaseContext {
  const localAdapter = useMemo(() => new LocalStorageFileSystemAdapter(), []);
  const fs = new FileSystem(localAdapter);
  const [localFs, setLocalFs] = useState<FileSystem>();
  const [root, setRoot] = useState<string>();

  const replaceLocalFs = useCallback(
    (handle: FileSystemDirectoryHandle) => {
      setLocalFs(new FileSystem(new FileSystemAccessFileSystemAdapter(handle)));
      setRoot(handle.name);
    },
    [setRoot, setLocalFs],
  );

  useEffect(() => {
    if (root) return;
    attemptLoadAdapterFromIndexedDb().then((adapter) => {
      if (!adapter) return;
      replaceLocalFs(adapter);
    });
  }, [root, replaceLocalFs]);

  const canUpgradeFs = `showDirectoryPicker` in window;

  const upgradeFs = useCallback(
    async (force = false) => {
      if (!canUpgradeFs || (root && !force)) return;
      const handler = await openNand2TetrisDirectory();
      const adapter = await createAndStoreLocalAdapterInIndexedDB(handler);
      replaceLocalFs(adapter);
    },
    [root, replaceLocalFs],
  );

  const closeFs = useCallback(async () => {
    if (!root) return;
    await removeLocalAdapterFromIndexedDB();
    setRoot(undefined);
    setLocalFs(undefined);
  }, [root]);

  const [status, setStatus] = useState("");

  return {
    fs,
    localFs,
    localFsRoot: root,
    status,
    setStatus,
    storage: localStorage,
    canUpgradeFs,
    upgradeFs,
    closeFs,
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
