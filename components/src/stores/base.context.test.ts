// Regression tests for nand2tetris/web-ide#592 (stored directory handle permission).
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: string[] = [];
let resolvePermission: (v: PermissionState) => void = () => undefined;
const handle = {
  name: "projects",
  kind: "directory",
  queryPermission: vi.fn(async () => "prompt" as PermissionState),
  requestPermission: vi.fn(
    () =>
      new Promise<PermissionState>((res) => {
        calls.push("requestPermission:start");
        resolvePermission = (v) => {
          calls.push("requestPermission:end");
          res(v);
        };
      }),
  ),
};

vi.mock("./base/indexDb.js", () => ({
  attemptLoadAdapterFromIndexedDb: vi.fn(async () => handle),
  createAndStoreLocalAdapterInIndexedDB: vi.fn(async (h: unknown) => h),
  removeLocalAdapterFromIndexedDB: vi.fn(async () => undefined),
}));

import { useBaseContext } from "./base.context.js";

describe("#592 stored handle permission flow", () => {
  beforeEach(() => {
    calls.length = 0;
    (window as unknown as Record<string, unknown>).showDirectoryPicker =
      vi.fn();
  });

  it("requestPermission() should not resolve until the browser prompt resolves", async () => {
    const { result } = renderHook(() => useBaseContext());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    let settled = false;
    const p = result.current.requestPermission().then(() => {
      settled = true;
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    // The caller must wait for the prompt before calling loadFs().
    expect(settled).toBe(false);
    resolvePermission("granted");
    await p;
  });

  it("loadFs() must not install the handle as fs when permission was denied", async () => {
    const { result } = renderHook(() => useBaseContext());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    await act(async () => {
      const pending = result.current.requestPermission();
      await new Promise((r) => setTimeout(r, 20));
      resolvePermission("denied");
      await pending;
      result.current.loadFs();
      await new Promise((r) => setTimeout(r, 20));
    });
    // An ungranted handle must not become fs (getDirectoryHandle would throw).
    expect(result.current.localFsRoot).toBeUndefined();
  });
});
