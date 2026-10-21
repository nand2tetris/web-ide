// Repro for nand2tetris/web-ide#592 (stored directory handle permission).
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const calls: string[] = [];
let resolvePermission: (v: PermissionState) => void = () => {};
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
  removeLocalAdapterFromIndexedDB: vi.fn(async () => {}),
}));

import { useBaseContext } from "./base.context.js";

describe("#592 stored handle permission flow", () => {
  beforeEach(() => {
    calls.length = 0;
    (window as unknown as Record<string, unknown>).showDirectoryPicker = vi.fn();
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
    // BUG: base.context.ts:70-75 does not return/await the inner promise chain,
    // so the caller (settings.tsx:113-115) proceeds to loadFs() immediately.
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
      await result.current.requestPermission();
      result.current.loadFs();
      await new Promise((r) => setTimeout(r, 20));
    });
    resolvePermission("denied");
    await act(async () => {
      await new Promise((r) => setTimeout(r, 10));
    });
    // BUG: loadFs (base.context.ts:77-82) never checks permission, so fs is the
    // un-permitted handle and every getDirectoryHandle throws NotAllowedError.
    expect(result.current.localFsRoot).toBeUndefined();
  });
});
