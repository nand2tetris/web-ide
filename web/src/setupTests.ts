import "@testing-library/jest-dom/vitest";
// import "@nand2tetris/simulator/setupTests.js";
import { i18n } from "@lingui/core";
import { en } from "make-plural/plurals";
import { messages } from "./locales/en/messages.mjs";

i18n.load("en", messages);
i18n.loadLocaleData({
  en: { plurals: en },
});
i18n.activate("en");
