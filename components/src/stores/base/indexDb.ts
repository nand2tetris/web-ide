import { assert } from "@davidsouther/jiffies/lib/esm/assert.js";

const IDB_NAME = "NAND2TetrisIndexedDB";
const IDB_VERSION = 1;
const IDB_FS_ADAPTER_OBJECT_STORE = "FileSystemAccess";
const IDB_FS_ADAPTER_KEY = "Handler";
function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
    request.onupgradeneeded = (e) => {
      request.result.createObjectStore(IDB_FS_ADAPTER_OBJECT_STORE);
    };
  });
}
export async function attemptLoadAdapterFromIndexedDb(): Promise<FileSystemDirectoryHandle | void> {
  const db = await openIndexedDb();
  return new Promise<FileSystemDirectoryHandle | void>((resolve, reject) => {
    const transaction = db.transaction(
      [IDB_FS_ADAPTER_OBJECT_STORE],
      "readonly",
    );
    const objectStore = transaction.objectStore(IDB_FS_ADAPTER_OBJECT_STORE);
    const handleRequest = objectStore.get(IDB_FS_ADAPTER_KEY);
    handleRequest.onsuccess = () => {
      const handle = handleRequest.result;
      if (handle === undefined) {
        resolve();
      } else {
        assert(
          handle instanceof FileSystemDirectoryHandle,
          `Retrieved ${IDB_FS_ADAPTER_KEY} in ${IDB_FS_ADAPTER_OBJECT_STORE} in ${IDB_NAME} is not a FileSystemDirectoryHandle`,
        );
        resolve(handle);
      }
    };
    transaction.onerror = () => {
      console.error("Error in loading FileSystemDirectoryHandle transaction", {
        err: transaction.error,
      });
      reject(transaction.error);
    };
    handleRequest.onerror = () => {
      console.error("Error in FileSystemDirectoryHandle handleRequest", {
        err: handleRequest.error,
      });
      reject(handleRequest.error);
    };
  });
}

export async function createAndStoreLocalAdapterInIndexedDB(
  handle: FileSystemDirectoryHandle,
): Promise<FileSystemDirectoryHandle> {
  const db = await openIndexedDb();
  const transaction = db.transaction(
    [IDB_FS_ADAPTER_OBJECT_STORE],
    "readwrite",
  );
  transaction
    .objectStore(IDB_FS_ADAPTER_OBJECT_STORE)
    .add(handle, IDB_FS_ADAPTER_KEY);
  transaction.commit();
  return new Promise<FileSystemDirectoryHandle>((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve(handle);
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function removeLocalAdapterFromIndexedDB() {
  const db = await openIndexedDb();
  const transaction = db.transaction(
    [IDB_FS_ADAPTER_OBJECT_STORE],
    "readwrite",
  );
  transaction
    .objectStore(IDB_FS_ADAPTER_OBJECT_STORE)
    .delete(IDB_FS_ADAPTER_KEY);
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}
