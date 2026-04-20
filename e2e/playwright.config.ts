import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 6_000,
  use: {
    baseURL: "http://localhost:3000/web-ide/",
    screenshot: "on",
    trace: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start -w web",
    cwd: "..",
    url: "http://localhost:3000/web-ide",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
