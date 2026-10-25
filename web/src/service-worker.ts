/// <reference lib="webworker" />

// Built by vite-plugin-pwa (injectManifest) to `service-worker.js`, the URL the
// Create React App build registered, so existing installs update into this
// worker instead of keeping the CRA one.

import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  matchPrecache,
  precacheAndRoute,
} from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { deleteLegacyCaches, hasLegacyPrecache } from "./sw/legacy";
import {
  isAppNavigation,
  isGoogleFontsFile,
  isGoogleFontsStylesheet,
  isUserGuideImage,
} from "./sw/routes";

declare const self: ServiceWorkerGlobalScope;

const BASE = import.meta.env.BASE_URL;
const ORIGIN = self.location.origin;
const SHELL = `${BASE}index.html`;

// Pages come from the network first so an online visit always gets the latest
// index.html and its current hashed chunks. Offline, or when the network takes
// too long, the precached shell answers every route. Registered before the
// precache route so the precached index.html never shadows a fresh one.
registerRoute(
  ({ request, url }) => isAppNavigation(request, url, ORIGIN, BASE),
  new NetworkFirst({
    cacheName: "web-ide-pages",
    networkTimeoutSeconds: 4,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      { handlerDidError: async () => matchPrecache(SHELL) },
    ],
  }),
);

// Build output: hashed JS and CSS (Monaco included), fonts, icons, the manifest
// and the user guide PDFs.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Material Symbols is loaded from Google Fonts by the app's stylesheet.
registerRoute(
  ({ url }) => isGoogleFontsStylesheet(url),
  new StaleWhileRevalidate({ cacheName: "web-ide-google-fonts-css" }),
);
registerRoute(
  ({ url }) => isGoogleFontsFile(url),
  new CacheFirst({
    cacheName: "web-ide-google-fonts",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 3600 }),
    ],
  }),
);

registerRoute(
  ({ url }) => isUserGuideImage(url, ORIGIN, BASE),
  new StaleWhileRevalidate({
    cacheName: "web-ide-user-guide",
    plugins: [new ExpirationPlugin({ maxEntries: 20 })],
  }),
);

// Activate as soon as installed. Tabs running the previous build keep working
// from the network; a chunk deleted by the deploy triggers one reload in the
// page (see preloadError.ts).
let replacingLegacy = false;
self.addEventListener("install", (event) => {
  event.waitUntil(
    hasLegacyPrecache(caches)
      .then((legacy) => {
        replacingLegacy = legacy;
      })
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await deleteLegacyCaches(caches);
      await self.clients.claim();
      if (!replacingLegacy) return;
      // Open tabs are running the CRA app, whose chunks no longer exist on
      // the server. Reload them into the current build. Not awaited: their
      // navigations wait on this worker finishing activation.
      for (const client of await self.clients.matchAll({ type: "window" })) {
        client.navigate(client.url).catch(() => undefined);
      }
    })(),
  );
});
