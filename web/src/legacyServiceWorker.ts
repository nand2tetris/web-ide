// Releases built with Create React App registered a Workbox service worker
// that precached the app. The Vite build does not emit service-worker.js, so
// browsers that still hold the old worker keep serving its stale precache and
// log a 404 on every update check. Remove the worker and its caches.
//
// The origin is shared with other GitHub Pages projects, so only touch
// registrations and caches that belong to this app's base URL.
export async function removeLegacyServiceWorker(): Promise<void> {
  try {
    const scope = new URL(import.meta.env.BASE_URL, window.location.href).href;

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations
          .filter((registration) => registration.scope.startsWith(scope))
          .map((registration) => registration.unregister()),
      );
    }

    if (typeof caches !== "undefined") {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.includes(scope))
          .map((name) => caches.delete(name)),
      );
    }
  } catch {
    // Cleanup is best effort; never break app startup.
  }
}
