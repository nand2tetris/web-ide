import { describe, expect, it, vi } from "vitest";
import { installPreloadErrorReload } from "./preloadError";

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
  it("reloads once, then lets the error surface", () => {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    } as Storage;
    const { fire, reload } = setup(() => storage);
    expect(fire().defaultPrevented).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(fire().defaultPrevented).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload when storage is unavailable", () => {
    const { fire, reload } = setup(() => {
      throw new Error("blocked");
    });
    expect(fire().defaultPrevented).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });
});
