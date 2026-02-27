import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["./build/**"],
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
