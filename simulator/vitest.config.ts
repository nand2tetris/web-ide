import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["build"],
    setupFiles: ["src/setupTests.ts"],
  },
});
