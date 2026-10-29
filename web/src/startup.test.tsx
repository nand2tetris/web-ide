import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-dom/client", () => ({
  default: { createRoot: () => ({ render: vi.fn() }) },
}));
vi.mock("./App", () => ({ default: () => null }));
vi.mock("./preloadError", () => ({ installPreloadErrorReload: vi.fn() }));
vi.mock("./registerServiceWorker", () => ({ registerServiceWorker: vi.fn() }));

afterEach(() => vi.unstubAllEnvs());

describe("parser recovery startup configuration", () => {
  it.each([undefined, "false", "true"])(
    "VITE_PARSER_RECOVERY=%s leaves a low-level parse strict",
    async (setting) => {
      vi.resetModules();
      vi.stubEnv("VITE_PARSER_RECOVERY", setting);
      await import("./index");
      const { HDL } = await import("@nand2tetris/simulator/languages/hdl.js");

      const outcome = HDL.parse("CHIP Not { PARTS: Nand(a=a b=a, out=x); }");

      expect(outcome.ast).toEqual(HDL.empty());
      expect(outcome.diagnostics).toHaveLength(1);
    },
  );
});
