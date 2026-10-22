// Kill-switch worker. Do not delete this file.
//
// Until the move to Vite (#694) this site shipped a CRA/Workbox worker at this
// same URL that precached hashed assets and served a stale index.html, which is
// what produced "Failed to fetch dynamically imported module .../Monaco-*.js"
// (#682). The app no longer registers a worker, but browsers that installed the
// old one keep re-checking *this* URL. A 404 there leaves the old worker (and
// its stale precache) in control forever, so we serve a worker that removes
// itself: it takes over immediately, deletes the old caches, unregisters, and
// reloads open tabs so they come from the network.
//
// Keep the cache predicate in sync with web/src/legacyServiceWorker.ts.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key === "images" ||
              (key.startsWith("workbox-") && key.includes("/web-ide/")),
          )
          .map((key) => caches.delete(key)),
      );
      const scope = self.registration.scope;
      await self.registration.unregister();
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of windows) {
        // matchAll covers the whole origin; leave sibling projects' tabs alone.
        if (!client.url.startsWith(scope)) continue;
        client.navigate(client.url).catch(() => {});
      }
    })(),
  );
});
