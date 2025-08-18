import { defineConfig } from "vitest/config";
// import react from "@vitejs/plugin-react";

export default defineConfig({
  // plugins: [react()],
  test: {
    exclude: ["build"],
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
  },
});
