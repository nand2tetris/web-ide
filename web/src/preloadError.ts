// After a deploy, a tab (or cached index.html) that still references the old
// content-hashed chunks fails with "Failed to fetch dynamically imported
// module" (#682). Reload once to pick up the new index.html. sessionStorage
// guards against a reload loop; the guard is lifted once the page has stayed
// up long enough to count as healthy, so a later deploy can heal too.

const KEY = "web-ide:preload-reload";
const HEALTHY_AFTER_MS = 10_000;

export function installPreloadErrorReload(
  target: Pick<Window, "addEventListener" | "location"> = window,
  storage: () => Storage = () => window.sessionStorage,
) {
  const reloadOnce = (event: Event) => {
    try {
      const s = storage();
      if (s.getItem(KEY)) return; // already tried: let the error surface
      s.setItem(KEY, "1");
    } catch {
      return; // cannot guard against loops without storage
    }
    event.preventDefault();
    target.location.reload();
  };
  target.addEventListener("vite:preloadError", reloadOnce);

  setTimeout(() => {
    try {
      storage().removeItem(KEY);
    } catch {
      // ignore
    }
  }, HEALTHY_AFTER_MS);
}
