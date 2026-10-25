import { formatter } from "@lingui/format-po";
import { defineConfig } from "@lingui/cli";

export default defineConfig({
  locales: ["en", "en-PL"],
  sourceLocale: "en",
  pseudoLocale: "en-PL",
  fallbackLocales: { "en-PL": "en" },
  catalogs: [
    {
      path: "src/locales/{locale}/messages",
      include: ["src", "public"],
    },
  ],
  format: formatter(),
});
