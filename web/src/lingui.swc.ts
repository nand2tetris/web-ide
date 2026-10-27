// SWC plugin options shared by vite.config.ts and the catalog ID test. The
// plugin must generate the same IDs as the Lingui CLI that builds the catalogs.
export const linguiSwcPlugin: [string, Record<string, unknown>] = [
  "@lingui/swc-plugin",
  {},
];
