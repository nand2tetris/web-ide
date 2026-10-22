// The app no longer ships a service worker (see #694). Browsers that installed
// the old CRA/Workbox worker still hold it and its precache of hashed assets,
// so remove both. The kill-switch at public/service-worker.js handles tabs that
// never reach this code; this covers hard refreshes and fresh index.html loads.

// Keep in sync with public/service-worker.js. Caches are per origin, and
// nand2tetris.github.io hosts other projects, so only delete our own.
export function isLegacyCache(key: string): boolean {
  return (
    key === "images" ||
    (key.startsWith("workbox-") && key.includes("/web-ide/"))
  );
}

export async function removeLegacyServiceWorkers(): Promise<void> {
  try {
    if ("serviceWorker" in navigator) {
      const scope = new URL(import.meta.env.BASE_URL, window.location.href)
        .href;
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations
          .filter((r) => r.scope.startsWith(scope))
          .map((r) => r.unregister()),
      );
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(isLegacyCache).map((key) => caches.delete(key)),
      );
    }
  } catch (e) {
    console.warn("Could not remove legacy service workers", e);
  }
}
