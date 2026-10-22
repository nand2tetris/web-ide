import { afterEach, describe, expect, it, vi } from "vitest";
import {
  isLegacyCache,
  removeLegacyServiceWorkers,
} from "./legacyServiceWorker";

describe("isLegacyCache", () => {
  it("matches only this app's old Workbox caches", () => {
    expect(
      isLegacyCache(
        "workbox-precache-v2-https://nand2tetris.github.io/web-ide/",
      ),
    ).toBe(true);
    expect(isLegacyCache("images")).toBe(true);
    expect(
      isLegacyCache("workbox-precache-v2-https://nand2tetris.github.io/other/"),
    ).toBe(false);
    expect(isLegacyCache("my-app-cache")).toBe(false);
  });
});

describe("removeLegacyServiceWorkers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, "serviceWorker");
  });

  it("unregisters in-scope workers and deletes only legacy caches", async () => {
    const base = new URL(import.meta.env.BASE_URL, window.location.href).href;
    const mine = { scope: base, unregister: vi.fn() };
    const other = { scope: "http://example.test/other/", unregister: vi.fn() };
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistrations: async () => [mine, other] },
    });
    const legacy = "workbox-precache-v2-https://nand2tetris.github.io/web-ide/";
    const del = vi.fn();
    vi.stubGlobal("caches", {
      keys: async () => ["images", "keep-me", legacy],
      delete: del,
    });
    await removeLegacyServiceWorkers();
    expect(mine.unregister).toHaveBeenCalled();
    expect(other.unregister).not.toHaveBeenCalled();
    expect(del.mock.calls.map((c) => c[0]).sort()).toEqual(
      ["images", legacy].sort(),
    );
  });

  it("never throws", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        getRegistrations: async () => {
          throw new Error("denied");
        },
      },
    });
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(removeLegacyServiceWorkers()).resolves.toBeUndefined();
  });
});
