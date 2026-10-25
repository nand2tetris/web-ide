import { lingui } from "@lingui/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/web-ide/",
  plugins: [
    react({
      plugins: [["@lingui/swc-plugin", { useLinguiV5IdGeneration: true }]],
    }),
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
    exclude: ["build/**", "node_modules/**"],
  },
  build: {
    outDir: "build",
    sourcemap: false,
  },
});
