import {
  FileSystem,
  LocalStorageFileSystemAdapter,
  RecordFileSystemAdapter,
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
import { cloneTree } from "../file_utils.js";
import {
  FileSystemAccessFileSystemAdapter,
  openNand2TetrisDirectory,
} from "./base/fs.js";
import {
  attemptLoadAdapterFromIndexedDb,
  createAndStoreLocalAdapterInIndexedDB,
  removeLocalAdapterFromIndexedDB,
} from "./base/indexDb.js";

export type StatusSeverity = "SUCCESS" | "WARNING" | "ERROR" | "INFO";

export interface BaseContext {
  fs: FileSystem;
  localFsRoot?: string;
  canUpgradeFs: boolean;
  upgradeFs: (force?: boolean, createFiles?: boolean) => Promise<void>;
  closeFs: () => void;
  status: { message: string; severity: StatusSeverity };
  setStatus: Action<string | { message: string; severity?: StatusSeverity }>;
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
        if (root) {
          const loaders = await import("@nand2tetris/projects/loader.js");
          await loaders.createFiles(newFs);
        } else {
          await cloneTree(fs, newFs, "/projects", (path: string) =>
            path.replace("/projects", "/").replace(/\/0*(\d+)/, "$1"),
          );
        }
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
            setStatus({
              message:
                "Permission denied. Please allow access to your file system.",
              severity: "ERROR",
            });
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
      if (root) {
        await removeLocalAdapterFromIndexedDB();
      }
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

  const [status, setStatusInternal] = useState<{
    message: string;
    severity: StatusSeverity;
  }>({ message: "", severity: "INFO" });

  const setStatus = useCallback(
    (input: string | { message: string; severity?: StatusSeverity }) => {
      if (typeof input === "string") {
        setStatusInternal({ message: input, severity: "INFO" });
      } else {
        setStatusInternal({
          message: input.message,
          severity: input.severity || "INFO",
        });
      }
    },
    [],
  );

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
  fs: new FileSystem(new RecordFileSystemAdapter()),
  canUpgradeFs: false,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  async upgradeFs() {},
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  closeFs() {},
  status: { message: "", severity: "INFO" },
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  setStatus() {},
  storage: {},
  permissionPrompt: {} as ReturnType<typeof useDialog>,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  async requestPermission() {},
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  loadFs() {},
});
