import { describe, expect, it } from "vitest";
import {
  isAppNavigation,
  isGoogleFontsFile,
  isGoogleFontsStylesheet,
  isUserGuideImage,
} from "./routes";

const ORIGIN = "https://nand2tetris.github.io";
const BASE = "/web-ide/";
const navigate = { mode: "navigate" } as Request;
const url = (path: string) => new URL(path, ORIGIN);

describe("isAppNavigation", () => {
  it.each([
    "/web-ide/",
    "/web-ide/chip",
    "/web-ide/chip/",
    "/web-ide/vm/?x=1",
  ])("matches app routes: %s", (path) => {
    expect(isAppNavigation(navigate, url(path), ORIGIN, BASE)).toBe(true);
  });

  it.each([
    "/web-ide/user_guide/chip.pdf",
    "/web-ide/manifest.json",
    "/other-project/",
  ])("skips files and other projects: %s", (path) => {
    expect(isAppNavigation(navigate, url(path), ORIGIN, BASE)).toBe(false);
  });

  it("skips subresource requests", () => {
    const request = { mode: "cors" } as Request;
    expect(isAppNavigation(request, url("/web-ide/"), ORIGIN, BASE)).toBe(
      false,
    );
  });

  it("skips other origins", () => {
    const other = new URL("https://example.com/web-ide/");
    expect(isAppNavigation(navigate, other, ORIGIN, BASE)).toBe(false);
  });
});

describe("Google Fonts matchers", () => {
  it("separates stylesheets from font files", () => {
    const css = new URL(
      "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
    );
    const font = new URL("https://fonts.gstatic.com/s/materialsymbols/x.woff2");

    expect(isGoogleFontsStylesheet(css)).toBe(true);
    expect(isGoogleFontsFile(css)).toBe(false);
    expect(isGoogleFontsFile(font)).toBe(true);
    expect(isGoogleFontsStylesheet(font)).toBe(false);
  });
});

describe("isUserGuideImage", () => {
  it("matches user guide screenshots only", () => {
    expect(
      isUserGuideImage(
        url("/web-ide/user_guide/07_settings.png"),
        ORIGIN,
        BASE,
      ),
    ).toBe(true);
    expect(
      isUserGuideImage(url("/web-ide/user_guide/chip.pdf"), ORIGIN, BASE),
    ).toBe(false);
    expect(isUserGuideImage(url("/web-ide/logo_192.png"), ORIGIN, BASE)).toBe(
      false,
    );
  });
});
