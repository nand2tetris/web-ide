import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  HEALTHY_AFTER_MS,
  installPreloadErrorReload,
  PRELOAD_RELOAD_KEY,
} from "./preloadError";

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    store,
    storage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    } as Storage,
  };
}

function setup(storage: () => Storage) {
  let handler: (e: Event) => void = () => undefined;
  const reload = vi.fn();
  installPreloadErrorReload(
    {
      addEventListener: (_: string, h: EventListenerOrEventListenerObject) => {
        handler = h as (e: Event) => void;
      },
      location: { reload } as unknown as Location,
    },
    storage,
  );
  const fire = () => {
    const event = new Event("vite:preloadError", { cancelable: true });
    handler(event);
    return event;
  };
  return { fire, reload };
}

describe("installPreloadErrorReload", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reloads once, then lets the error surface", () => {
    const { storage } = memoryStorage();
    const { fire, reload } = setup(() => storage);

    expect(fire().defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(fire().defaultPrevented).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload after a reload in the same session", () => {
    const { store, storage } = memoryStorage();
    store.set(PRELOAD_RELOAD_KEY, "1");
    const { fire, reload } = setup(() => storage);

    expect(fire().defaultPrevented).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("re-arms once the page has stayed up", () => {
    const { store, storage } = memoryStorage();
    store.set(PRELOAD_RELOAD_KEY, "1");
    const { fire, reload } = setup(() => storage);

    vi.advanceTimersByTime(HEALTHY_AFTER_MS);

    expect(store.has(PRELOAD_RELOAD_KEY)).toBe(false);
    expect(fire().defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload when storage is unavailable", () => {
    const { fire, reload } = setup(() => {
      throw new Error("blocked");
    });

    expect(fire().defaultPrevented).toBe(false);
    expect(reload).not.toHaveBeenCalled();
    vi.advanceTimersByTime(HEALTHY_AFTER_MS);
  });
});
