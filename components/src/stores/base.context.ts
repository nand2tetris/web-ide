import {
  FileSystem,
  LocalStorageFileSystemAdapter,
} from "@davidsouther/jiffies/fs.ts";
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
import { NO_STATUS, type StatusContext, useStatus } from "./status.js";

/** Storage key of the Attempt Recovery setting. */
export const ATTEMPT_RECOVERY_KEY = "/attemptRecovery";

/** Attempt Recovery is on unless the stored setting says otherwise. */
export function readAttemptRecovery(
  storage: Pick<Storage, "getItem">,
): boolean {
  return storage.getItem(ATTEMPT_RECOVERY_KEY) !== "false";
}

export interface BaseContext extends StatusContext {
  fs: FileSystem;
  localFsRoot?: string;
  canUpgradeFs: boolean;
  upgradeFs: (force?: boolean, createFiles?: boolean) => Promise<void>;
  closeFs: () => void;
  storage: Record<string, string>;
  /**
   * Whether a syntax mistake still allows the later diagnostics. A store
   * outlives a change of this value, so each store reads it through a ref per
   * call instead of capturing it once.
   */
  attemptRecovery: boolean;
  setAttemptRecovery: Action<boolean>;
  permissionPrompt: ReturnType<typeof useDialog>;
  requestPermission: AsyncAction<void>;
  loadFs: Action<void>;
}

export function useBaseContext(): BaseContext {
  const statusContext = useStatus();
  const { setStatus } = statusContext;
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
    const adapter = await attemptLoadAdapterFromIndexedDb();
    if (!adapter) return;
    await adapter.requestPermission({ mode: "readwrite" });
  };

  const loadFs = () => {
    attemptLoadAdapterFromIndexedDb().then(async (adapter) => {
      if (!adapter) return;
      // Never install a handle without permission: every access would throw.
      const permission = await adapter.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") return;
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

  const [attemptRecovery, setAttemptRecoveryState] = useState(() =>
    readAttemptRecovery(localStorage),
  );
  const setAttemptRecovery = useCallback((value: boolean) => {
    localStorage.setItem(ATTEMPT_RECOVERY_KEY, String(value));
    setAttemptRecoveryState(value);
  }, []);

  return {
    fs,
    localFsRoot: root,
    ...statusContext,
    storage: localStorage,
    attemptRecovery,
    setAttemptRecovery,
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
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  async upgradeFs() {},
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  closeFs() {},
  ...NO_STATUS,
  storage: {},
  attemptRecovery: true,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  setAttemptRecovery() {},
  permissionPrompt: {} as ReturnType<typeof useDialog>,
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  async requestPermission() {},
  // biome-ignore lint/suspicious/noEmptyBlockStatements: abstract base
  loadFs() {},
});
