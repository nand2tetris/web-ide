// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
// import "@computron5k/simulator/setupTests.js";
import { i18n } from "@lingui/core";
import { en } from "make-plural/plurals";
import { messages } from "./locales/en/messages";

i18n.load("en", messages);
i18n.loadLocaleData({
  en: { plurals: en },
});
i18n.activate("en");
