import { existsSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

// https://github.com/nand2tetris/web-ide/issues/694 (and #682)
// `web/src/index.tsx` registers `${BASE_URL}service-worker.js`, but the Vite
// build never emits web/src/service-worker.ts (it relies on CRA's Workbox
// `__WB_MANIFEST` injection). On GitHub Pages that URL 404s, and stale CRA-era
// workers / cached index.html keep referencing hashed chunks that no longer
// exist (#682: "Failed to fetch dynamically imported module .../Monaco-*.js").
// Needs `npm run build -w web` first.
const build = join(__dirname, "..", "..", "..", "web", "build");

test(
  "production build emits the service worker that index.tsx registers",
  { tag: "@bug" },
  async () => {
    test.skip(!existsSync(join(build, "index.html")), "run `npm run build -w web` first");
    expect(existsSync(join(build, "service-worker.js"))).toBe(true);
  },
);
