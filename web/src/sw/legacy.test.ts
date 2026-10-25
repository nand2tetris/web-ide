import { describe, expect, it } from "vitest";
import { deleteLegacyCaches, hasLegacyPrecache } from "./legacy";

const SCOPE = "https://nand2tetris.github.io/web-ide/";

// A minimal CacheStorage holding request URLs per cache name.
function fakeCaches(contents: Record<string, string[]>) {
  const data = new Map(Object.entries(contents));
  const storage = {
    keys: async () => [...data.keys()],
    open: async (name: string) =>
      ({
        keys: async () =>
          (data.get(name) ?? []).map((u) => ({ url: u }) as Request),
      }) as unknown as Cache,
    delete: async (name: string) => data.delete(name),
  } as unknown as CacheStorage;
  return { data, storage };
}

describe("hasLegacyPrecache", () => {
  it("detects CRA bundles in the Workbox precache", async () => {
    const { storage } = fakeCaches({
      [`workbox-precache-v2-${SCOPE}`]: [
        `${SCOPE}index.html?__WB_REVISION__=abc`,
        `${SCOPE}static/js/main.1234abcd.js`,
      ],
    });

    expect(await hasLegacyPrecache(storage)).toBe(true);
  });

  it("ignores a precache of the Vite build", async () => {
    const { storage } = fakeCaches({
      [`workbox-precache-v2-${SCOPE}`]: [
        `${SCOPE}index.html?__WB_REVISION__=abc`,
        `${SCOPE}assets/index-Bvr-jZlL.js`,
      ],
    });

    expect(await hasLegacyPrecache(storage)).toBe(false);
  });

  it("ignores runtime caches", async () => {
    const { storage } = fakeCaches({
      "web-ide-pages": [`${SCOPE}static/js/main.1234abcd.js`],
    });

    expect(await hasLegacyPrecache(storage)).toBe(false);
  });
});

describe("deleteLegacyCaches", () => {
  it("deletes the CRA runtime cache and keeps the others", async () => {
    const { data, storage } = fakeCaches({
      images: [],
      [`workbox-precache-v2-${SCOPE}`]: [],
      "web-ide-google-fonts": [],
    });

    expect(await deleteLegacyCaches(storage)).toEqual(["images"]);
    expect([...data.keys()]).toEqual([
      `workbox-precache-v2-${SCOPE}`,
      "web-ide-google-fonts",
    ]);
  });
});
