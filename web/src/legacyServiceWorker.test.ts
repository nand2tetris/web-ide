import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { removeLegacyServiceWorker } from "./legacyServiceWorker";

// Pin the base so the test does not depend on the vitest config.
vi.stubEnv("BASE_URL", "/web-ide/");

const scope = new URL(import.meta.env.BASE_URL, window.location.href).href;
const otherScope = new URL("/other-project/", window.location.href).href;

function registration(scope: string) {
  return { scope, unregister: vi.fn().mockResolvedValue(true) };
}

describe("removeLegacyServiceWorker", () => {
  const ours = registration(scope);
  const theirs = registration(otherScope);
  const cacheNames = [
    `workbox-precache-v2-${scope}`,
    `workbox-precache-v2-${otherScope}`,
    "unrelated",
  ];
  const cacheStorage = {
    keys: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    ours.unregister.mockClear();
    theirs.unregister.mockClear();
    cacheStorage.keys.mockResolvedValue(cacheNames);
    cacheStorage.delete.mockReset().mockResolvedValue(true);
    vi.stubGlobal("caches", cacheStorage);
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistrations: vi.fn().mockResolvedValue([ours, theirs]) },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, "serviceWorker");
  });

  it("unregisters workers under the app base only", async () => {
    await removeLegacyServiceWorker();
    expect(ours.unregister).toHaveBeenCalledTimes(1);
    expect(theirs.unregister).not.toHaveBeenCalled();
  });

  it("deletes the app's workbox caches only", async () => {
    await removeLegacyServiceWorker();
    expect(cacheStorage.delete).toHaveBeenCalledTimes(1);
    expect(cacheStorage.delete).toHaveBeenCalledWith(
      `workbox-precache-v2-${scope}`,
    );
  });

  it("does nothing when service workers are unsupported", async () => {
    Reflect.deleteProperty(navigator, "serviceWorker");
    vi.stubGlobal("caches", undefined);
    await expect(removeLegacyServiceWorker()).resolves.toBeUndefined();
    expect(cacheStorage.delete).not.toHaveBeenCalled();
  });

  it("never throws", async () => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistrations: vi.fn().mockRejectedValue(new Error("no")) },
    });
    await expect(removeLegacyServiceWorker()).resolves.toBeUndefined();
  });
});
