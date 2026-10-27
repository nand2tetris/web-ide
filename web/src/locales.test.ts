import { globSync, readFileSync } from "node:fs";
import { transform } from "@swc/core";
import { linguiSwcPlugin } from "./lingui.swc";
import { messages } from "./locales";

// The SWC plugin writes each message ID into the compiled source, and the
// Lingui CLI writes the same ID into the catalog. If the two disagree, the
// runtime renders the raw ID.
test("every macro message ID exists in the compiled catalog", async () => {
  const missing: string[] = [];
  for (const file of globSync("src/**/*.tsx")) {
    const source = readFileSync(file, "utf8");
    if (!source.includes("@lingui/")) continue;
    const { code } = await transform(source, {
      filename: file,
      jsc: {
        parser: { syntax: "typescript", tsx: true },
        target: "es2022",
        experimental: { plugins: [linguiSwcPlugin] },
      },
    });
    for (const [, id, message] of code.matchAll(
      /id:\s*"([^"]+)",\s*message:\s*"([^"]*)"/g,
    )) {
      if (!(id in messages.en)) missing.push(`${file}: ${id} (${message})`);
    }
  }
  expect(missing).toEqual([]);
});
