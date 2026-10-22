import { existsSync, mkdtempSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";
import { expect, test } from "@playwright/test";

// https://github.com/nand2tetris/web-ide/issues/694 and #682.
//
// Story: a returning user has the CRA-era service worker installed. Its update
// check fetches /web-ide/service-worker.js, which 404'd on the Vite build, so
// the old worker kept serving a stale index.html and old hashed chunks
// ("Failed to fetch dynamically imported module .../Monaco-*.js").
//
// Needs `npm run build -w web` first (CI builds before e2e). Set BUILD_DIR to
// point at another build, for example a pre-fix one, to watch this fail.
const build =
  process.env.BUILD_DIR ?? join(__dirname, "..", "..", "..", "web", "build");

const TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
};

// Serves `root()` under /web-ide/ like GitHub Pages: unknown paths 404,
// directories answer with their index.html.
function serve(root: () => string): Promise<Server> {
  const server = createServer((req, res) => {
    const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    if (!path.startsWith("/web-ide/")) {
      res.writeHead(404).end();
      return;
    }
    let file = join(root(), normalize(path.slice("/web-ide/".length)));
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, "index.html");
    }
    if (!file.startsWith(root()) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, () => resolve(server)));
}

// A stand-in for the CRA/Workbox build: precaches its shell and serves it for
// every navigation, and never updates because /service-worker.js is gone.
function writeOldSite(): string {
  const dir = mkdtempSync(join(tmpdir(), "old-site-"));
  writeFileSync(
    join(dir, "index.html"),
    `<!doctype html><title>old</title><div id="root">OLD SHELL</div>
<script>navigator.serviceWorker.register("/web-ide/service-worker.js");</script>`,
  );
  writeFileSync(
    join(dir, "service-worker.js"),
    `const CACHE = "workbox-precache-v2-" + self.location.origin + "/web-ide/";
self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.add("/web-ide/index.html"))));
self.addEventListener("activate", (e) =>
  e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate")
    e.respondWith(caches.match("/web-ide/index.html"));
});`,
  );
  return dir;
}

test("old service workers are removed and failed chunk imports self-heal", async ({
  browser,
}) => {
  test.skip(
    !existsSync(join(build, "index.html")),
    "run `npm run build -w web` first",
  );
  const oldSite = writeOldSite();
  let root = oldSite;
  const server = await serve(() => root);
  const origin = `http://localhost:${(server.address() as AddressInfo).port}`;
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await test.step("an old worker controls the site and serves a stale shell", async () => {
      await page.goto(`${origin}/web-ide/`);
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.reload();
      await expect(page.locator("#root")).toHaveText("OLD SHELL");
      expect(
        await page.evaluate(() => navigator.serviceWorker.controller !== null),
      ).toBe(true);
    });

    await test.step("after a deploy, the old worker and its cache disappear and the new app loads", async () => {
      root = build;
      await page.reload(); // still answered from the old worker's cache
      await expect
        .poll(
          async () => {
            try {
              return await page.evaluate(async () => ({
                workers: (await navigator.serviceWorker.getRegistrations())
                  .length,
                caches: (await caches.keys()).length,
                title: document.title,
              }));
            } catch {
              return "navigating"; // the worker is reloading the tab
            }
          },
          { timeout: 30_000 },
        )
        .toMatchObject({ workers: 0, caches: 0, title: expect.not.stringMatching(/^old$/) });
      await expect(page.locator("#root")).not.toHaveText("OLD SHELL");
    });

    await test.step("a missing chunk after a deploy reloads once and recovers", async () => {
      let blocked = 0;
      await page.route("**/assets/Monaco-*.js", (route) => {
        blocked += 1;
        return blocked === 1 ? route.fulfill({ status: 404 }) : route.continue();
      });
      await page.goto(`${origin}/web-ide/chip/`);
      await expect(page.locator(".monaco-editor").first()).toBeVisible({
        timeout: 30_000,
      });
      expect(blocked).toBeGreaterThanOrEqual(2);
    });
  } finally {
    await context.close();
    server.close();
  }
});
