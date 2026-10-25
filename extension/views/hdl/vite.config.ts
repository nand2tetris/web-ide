import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Bundles the HDL webview into a single classic script (main.js) and
// stylesheet (main.css), which extension/src/views/hdl.ts loads by name.
export default defineConfig({
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "../../out/views/hdl",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: "src/index.tsx",
      formats: ["iife"],
      name: "nand2tetrisHdl",
      fileName: () => "main.js",
      cssFileName: "main",
    },
  },
});
