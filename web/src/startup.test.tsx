import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-dom/client", () => ({
  default: { createRoot: () => ({ render: vi.fn() }) },
}));
vi.mock("./App", () => ({ default: () => null }));
vi.mock("./preloadError", () => ({ installPreloadErrorReload: vi.fn() }));
vi.mock("./registerServiceWorker", () => ({ registerServiceWorker: vi.fn() }));

afterEach(() => vi.unstubAllEnvs());

describe("parser recovery startup configuration", () => {
  it.each([
    [undefined, false],
    ["false", false],
    ["true", true],
    ["TRUE", false],
  ])(
    "VITE_PARSER_RECOVERY=%s enables recovery: %s",
    async (setting, enabled) => {
      vi.resetModules();
      vi.stubEnv("VITE_PARSER_RECOVERY", setting);
      const { isParserRecoveryEnabled } = await import(
        "@nand2tetris/simulator/languages/base.js"
      );
      expect(isParserRecoveryEnabled()).toBe(false);
      await import("./index");
      expect(isParserRecoveryEnabled()).toBe(enabled);
    },
  );
});
