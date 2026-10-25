import type { Messages } from "@lingui/core";

// One entry per locale in `lingui.locales` (web/package.json). The lingui()
// Vite plugin compiles each messages.po catalog when it is imported.
const catalogs = import.meta.glob<Messages>("./locales/*/messages.po", {
  eager: true,
  import: "messages",
});

export const messages: Record<string, Messages> = Object.fromEntries(
  Object.entries(catalogs).map(([path, catalog]) => [
    path.split("/")[2],
    catalog,
  ]),
);
