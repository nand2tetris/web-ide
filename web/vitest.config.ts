import { defineConfig, Plugin } from "vitest/config";
import react from "@vitejs/plugin-react";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [
        react({
      babel: {
        plugins: ["@lingui/babel-plugin-lingui-macro"],
      },
    }) as unknown as Plugin,
    lingui() as unknown as Plugin,

  ],
  test: {
    exclude: ["./build/**"],
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
