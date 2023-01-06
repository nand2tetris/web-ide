import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.ROOT ?? "http://localhost:3000",
  },
});
