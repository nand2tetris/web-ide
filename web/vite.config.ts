import { getCatalogs } from "@lingui/cli/api";
import { getConfig } from "@lingui/conf";
import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { linguiSwcPlugin } from "./src/lingui.swc";

// Runs `lingui extract` when the dev server, build, or Vitest starts, so the
// gitignored src/locales/<locale>/messages.po catalogs always exist. The
// lingui() plugin then compiles each imported .po file on demand.
function linguiExtract(): Plugin {
  return {
    name: "lingui-extract",
    async buildStart() {
      const config = getConfig();
      for (const catalog of await getCatalogs(config)) {
        await catalog.make({ orderBy: config.orderBy, clean: true });
      }
    },
  };
}

export default defineConfig({
  base: "/web-ide/",
  plugins: [
    react({
      plugins: [linguiSwcPlugin],
    }),
    linguiExtract(),
    lingui(),
    VitePWA({
      // src/service-worker.ts is built to service-worker.js, the URL the CRA
      // build registered, so old installs update into the new worker.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "service-worker.ts",
      // src/registerServiceWorker.ts registers it; public/manifest.json is kept.
      injectRegister: false,
      manifest: false,
      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,ttf,woff2,json,pdf}",
          "robots.txt",
        ],
        globIgnores: [
          // Language workers bundled by monaco-editor that the app never starts.
          "assets/{ts,css,html,json}.worker-*.js",
          // Screenshots are runtime cached instead.
          "user_guide/*.png",
        ],
        // The Monaco chunk is about 3.7 MB.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  worker: {
    format: "es",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    exclude: ["build/**", "web-ide/**", "node_modules/**"],
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
