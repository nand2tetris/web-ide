// Repro for #592 secondary theory: store uses IDBObjectStore.add (not put),
// so re-selecting a folder while a stale handle exists fails with ConstraintError.
import { describe, expect, it, vi } from "vitest";
import { createAndStoreLocalAdapterInIndexedDB } from "./indexDb.js";

describe("#592 indexDb add vs put", () => {
  it("overwrites an existing stored handle (uses put)", async () => {
    const store = { add: vi.fn(), put: vi.fn(), delete: vi.fn() };
    const tx: Record<string, unknown> = {
      objectStore: () => store,
      commit: () => setTimeout(() => (tx.oncomplete as () => void)?.(), 0),
    };
    const db = { transaction: () => tx };
    const req: Record<string, unknown> = {};
    (window as unknown as Record<string, unknown>).indexedDB = {
      open: () => {
        setTimeout(() => (req.onsuccess as () => void)?.(), 0);
        return Object.assign(req, { result: db });
      },
    };
    await createAndStoreLocalAdapterInIndexedDB({ name: "x" } as never);
    // add() on an existing key => ConstraintError in real IndexedDB
    expect(store.put).toHaveBeenCalled();
  });
});
