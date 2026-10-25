import {
  existsSync,
  mkdtempSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { extname, join, normalize } from "node:path";
import { type BrowserContext, expect, type Page, test } from "@playwright/test";

// Issues #694 and #682. These tests run against the production build, because
// the dev server does not emit or register the service worker. CI runs
// `npm run build` before the e2e suite; locally, run `npm run build -w web`.
const BUILD = join(__dirname, "..", "..", "..", "web", "build");

const TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ttf": "font/ttf",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
};

interface Site {
  origin: string;
  root: string;
  offline: boolean;
  /** Paths that answer 404 once each, like chunks removed by a deploy. */
  removed: RegExp[];
  close(): Promise<void>;
}

// Serves a directory under /web-ide/ the way GitHub Pages does: directories
// answer with their index.html and unknown paths 404. While `offline` is set,
// every connection is dropped.
async function serve(root: string): Promise<Site> {
  const site = { root, offline: false, removed: [] } as unknown as Site;
  const server: Server = createServer((req, res) => {
    if (site.offline) {
      req.socket.destroy();
      return;
    }
    const path = decodeURIComponent((req.url ?? "/").split("?")[0]);
    const removed = site.removed.findIndex((pattern) => pattern.test(path));
    if (removed >= 0) {
      site.removed.splice(removed, 1);
      res.writeHead(404).end();
      return;
    }
    if (!path.startsWith("/web-ide/")) {
      res.writeHead(404).end();
      return;
    }
    let file = join(site.root, normalize(path.slice("/web-ide/".length)));
    if (existsSync(file) && statSync(file).isDirectory()) {
      file = join(file, "index.html");
    }
    if (!file.startsWith(site.root) || !existsSync(file)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "content-type": TYPES[extname(file)] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(readFileSync(file));
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  site.origin = `http://localhost:${(server.address() as AddressInfo).port}`;
  site.close = () =>
    new Promise((resolve) => {
      server.closeAllConnections();
      server.close(() => resolve());
    });
  return site;
}

async function controllingWorker(page: Page) {
  return page.evaluate(() => navigator.serviceWorker.controller?.scriptURL);
}

test.describe("service worker", () => {
  let site: Site;
  let context: BrowserContext;

  test.skip(
    !existsSync(join(BUILD, "service-worker.js")),
    "run `npm run build -w web` first",
  );

  test.beforeEach(async ({ browser }) => {
    site = await serve(BUILD);
    context = await browser.newContext();
  });

  test.afterEach(async () => {
    await context.close();
    await site.close();
  });

  test("registers at /web-ide/service-worker.js and reloads offline", async () => {
    const page = await context.newPage();

    await test.step("the worker registers under the base path and takes control", async () => {
      await page.goto(`${site.origin}/web-ide/chip/`);
      const registration = await page.evaluate(async () => {
        const r = await navigator.serviceWorker.ready;
        return { scope: r.scope, script: r.active?.scriptURL };
      });
      expect(registration).toEqual({
        scope: `${site.origin}/web-ide/`,
        script: `${site.origin}/web-ide/service-worker.js`,
      });
      await expect
        .poll(() => controllingWorker(page))
        .toBe(`${site.origin}/web-ide/service-worker.js`);
      await expect(page.locator(".ChipPage")).toBeVisible();
    });

    await test.step("offline, a reload still renders the app and Monaco", async () => {
      site.offline = true;
      await page.reload();
      await expect(page.locator(".ChipPage")).toBeVisible();
      await expect(page.locator(".monaco-editor").first()).toBeVisible({
        timeout: 30_000,
      });
    });

    await test.step("offline, a route not visited yet loads from the precached shell", async () => {
      await page.goto(`${site.origin}/web-ide/vm/`);
      await expect(page.locator(".VmPage")).toBeVisible();
    });
  });

  test("replaces the CRA worker registered at the same URL", async () => {
    const old = writeCraSite();
    site.root = old;
    const page = await context.newPage();

    await test.step("a CRA-era worker controls the site and serves a stale shell", async () => {
      await page.goto(`${site.origin}/web-ide/`);
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.reload();
      await expect(page.locator("#root")).toHaveText("OLD SHELL");
      expect(await page.evaluate(() => caches.has("images"))).toBe(true);
    });

    await test.step("after the deploy, the new worker takes over and reloads the tab", async () => {
      site.root = BUILD;
      await page.reload(); // still the old shell; triggers the update check
      await expect
        .poll(
          async () => {
            try {
              return await page.evaluate(async () => ({
                title: document.title,
                images: await caches.has("images"),
                registrations: (
                  await navigator.serviceWorker.getRegistrations()
                ).length,
                controller: navigator.serviceWorker.controller?.scriptURL,
              }));
            } catch {
              return "navigating"; // the worker is reloading the tab
            }
          },
          { timeout: 30_000 },
        )
        .toEqual({
          title: "NAND2Tetris",
          images: false,
          registrations: 1,
          controller: `${site.origin}/web-ide/service-worker.js`,
        });
      await expect(page.locator("#root")).not.toHaveText("OLD SHELL");
    });
  });

  test("a chunk removed by a deploy reloads the page once and recovers", async () => {
    const page = await context.newPage();
    await page.goto(`${site.origin}/web-ide/`);
    await expect
      .poll(() => controllingWorker(page))
      .toBe(`${site.origin}/web-ide/service-worker.js`);

    // A new deploy activated: the old Monaco chunk is gone from the precache
    // and, for one request, from the server.
    await page.evaluate(async () => {
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          if (/\/assets\/Monaco-[^/]*\.js/.test(request.url)) {
            await cache.delete(request);
          }
        }
      }
    });
    site.removed.push(/\/assets\/Monaco-[^/]*\.js$/);

    await page.goto(`${site.origin}/web-ide/chip/`);
    await expect(page.locator(".monaco-editor").first()).toBeVisible({
      timeout: 30_000,
    });
    expect(site.removed).toEqual([]);
  });
});

// A stand-in for the Create React App build: a Workbox-style precache holding
// CRA bundles, the `images` runtime cache, and a worker that serves the cached
// shell for every navigation.
function writeCraSite(): string {
  const dir = mkdtempSync(join(tmpdir(), "cra-site-"));
  writeFileSync(
    join(dir, "index.html"),
    `<!doctype html><title>old</title><div id="root">OLD SHELL</div>
<script>navigator.serviceWorker.register("/web-ide/service-worker.js");</script>`,
  );
  writeFileSync(join(dir, "main.js"), "// CRA bundle");
  writeFileSync(
    join(dir, "service-worker.js"),
    `const PRECACHE = "workbox-precache-v2-" + self.registration.scope;
self.addEventListener("install", (e) =>
  e.waitUntil(Promise.all([
    caches.open(PRECACHE).then(async (c) => {
      await c.add("/web-ide/index.html");
      await c.put("/web-ide/static/js/main.1234abcd.js", await fetch("/web-ide/main.js"));
    }),
    caches.open("images"),
  ])));
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  if (e.request.mode === "navigate")
    e.respondWith(caches.open(PRECACHE).then((c) => c.match("/web-ide/index.html")));
});`,
  );
  return dir;
}
