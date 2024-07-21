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

export interface BaseContext {
  fs: FileSystem;
  localFsRoot?: string;
  canUpgradeFs: boolean;
  upgradeFs: (force?: boolean) => Promise<void>;
  closeFs: () => void;
  status: string;
  setStatus: (status: string) => void;
  storage: Record<string, string>;
}

export function useBaseContext(): BaseContext {
  const localAdapter = useMemo(() => new LocalStorageFileSystemAdapter(), []);
  const [fs, setFs] = useState(new FileSystem(localAdapter));
  const [root, setRoot] = useState<string>();

  const setLocalFs = useCallback(
    (handle: FileSystemDirectoryHandle) => {
      setFs(new FileSystem(new FileSystemAccessFileSystemAdapter(handle)));
      setRoot(handle.name);
    },
    [setRoot, setFs],
  );

  useEffect(() => {
    if (root) return;
    attemptLoadAdapterFromIndexedDb().then((adapter) => {
      if (!adapter) return;
      setLocalFs(adapter);
    });
  }, [root, setLocalFs]);

  const canUpgradeFs = `showDirectoryPicker` in window;

  const upgradeFs = useCallback(
    async (force = false) => {
      if (!canUpgradeFs || (root && !force)) return;
      const handler = await openNand2TetrisDirectory();
      const adapter = await createAndStoreLocalAdapterInIndexedDB(handler);
      setLocalFs(adapter);
    },
    [root, setLocalFs],
  );

  const closeFs = useCallback(async () => {
    if (!root) return;
    await removeLocalAdapterFromIndexedDB();
    setRoot(undefined);
    setFs(new FileSystem(localAdapter));
  }, [root]);

  const [status, setStatus] = useState("");

  return {
    fs,
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
  async upgradeFs() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeFs() {},
  status: "",
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setStatus() {},
  storage: {},
});
