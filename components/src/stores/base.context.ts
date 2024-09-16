import {
  FileSystem,
  LocalStorageFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { Action, AsyncAction } from "@nand2tetris/simulator/types.js";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDialog } from "../dialog.js";
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
  upgradeFs: (force?: boolean, createFiles?: boolean) => Promise<void>;
  closeFs: () => void;
  status: string;
  setStatus: Action<string>;
  storage: Record<string, string>;
  permissionPrompt: ReturnType<typeof useDialog>;
  requestPermission: AsyncAction<void>;
  loadFs: Action<void>;
}

export function useBaseContext(): BaseContext {
  const localAdapter = useMemo(() => new LocalStorageFileSystemAdapter(), []);
  const [fs, setFs] = useState(new FileSystem(localAdapter));
  const [root, setRoot] = useState<string>();

  const permissionPrompt = useDialog();

  const setLocalFs = useCallback(
    async (handle: FileSystemDirectoryHandle, createFiles = false) => {
      // We will not mirror the changes in localStorage, since they will be saved in the user's file system
      const newFs = new FileSystem(
        new FileSystemAccessFileSystemAdapter(handle),
      );
      if (createFiles) {
        const loaders = await import("@nand2tetris/projects/loader.js");
        await loaders.createFiles(newFs);
      }
      setFs(newFs);
      setRoot(handle.name);
    },
    [setRoot, setFs],
  );

  const requestPermission = async () => {
    attemptLoadAdapterFromIndexedDb().then(async (adapter) => {
      if (!adapter) return;
      await adapter.requestPermission({ mode: "readwrite" });
    });
  };

  const loadFs = () => {
    attemptLoadAdapterFromIndexedDb().then(async (adapter) => {
      if (!adapter) return;
      setLocalFs(adapter);
    });
  };

  useEffect(() => {
    if (root) return;

    if ("showDirectoryPicker" in window) {
      attemptLoadAdapterFromIndexedDb().then(async (adapter) => {
        if (!adapter) return;

        const permissions = await adapter.queryPermission({
          mode: "readwrite",
        });

        switch (permissions) {
          case "granted":
            setLocalFs(adapter);
            break;
          case "prompt":
            permissionPrompt.open();
            break;
          case "denied":
            setStatus(
              "Permission denied. Please allow access to your file system.",
            );
            break;
        }
      });
    }
  }, [root, setLocalFs]);

  const canUpgradeFs = `showDirectoryPicker` in window;

  const upgradeFs = useCallback(
    async (force = false, createFiles = false) => {
      if (!canUpgradeFs || (root && !force)) return;
      const handler = await openNand2TetrisDirectory();
      const adapter = await createAndStoreLocalAdapterInIndexedDB(handler);
      await setLocalFs(adapter, createFiles);
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
    permissionPrompt,
    upgradeFs,
    requestPermission,
    closeFs,
    loadFs,
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
  permissionPrompt: {} as ReturnType<typeof useDialog>,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async requestPermission() {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  loadFs() {},
});
