import "@testing-library/jest-dom/vitest";
import { i18n } from "@lingui/core";
import * as matchers from "@testing-library/jest-dom/matchers";
import { en } from "make-plural/plurals";
import { expect } from "vitest";
import { messages } from "./locales/en/messages.mjs";

expect.extend(matchers);

i18n.load("en", messages);
i18n.loadLocaleData({
  en: { plurals: en },
});
i18n.activate("en");
