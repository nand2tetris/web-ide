// After a deploy, a tab that still references the previous build's hashed
// chunks fails with "Failed to fetch dynamically imported module" (#682).
// Reload once to pick up the new index.html. sessionStorage guards against a
// reload loop; the guard is lifted once the page has stayed up long enough to
// count as healthy, so a later deploy can heal too.

export const PRELOAD_RELOAD_KEY = "web-ide:preload-reload";
export const HEALTHY_AFTER_MS = 10_000;

export function installPreloadErrorReload(
  target: Pick<Window, "addEventListener" | "location"> = window,
  storage: () => Storage = () => window.sessionStorage,
) {
  target.addEventListener("vite:preloadError", (event: Event) => {
    try {
      const s = storage();
      if (s.getItem(PRELOAD_RELOAD_KEY)) return; // already tried: surface the error
      s.setItem(PRELOAD_RELOAD_KEY, "1");
    } catch {
      return; // without storage there is no loop guard, so do not reload
    }
    event.preventDefault();
    target.location.reload();
  });

  setTimeout(() => {
    try {
      storage().removeItem(PRELOAD_RELOAD_KEY);
    } catch {
      // Storage unavailable; nothing to clear.
    }
  }, HEALTHY_AFTER_MS);
}
