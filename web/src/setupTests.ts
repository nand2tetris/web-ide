import "@testing-library/jest-dom/vitest";
import "@nand2tetris/simulator/setupTests.js";
import { i18n } from "@lingui/core";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { messages } from "./locales/en/messages.mjs";

i18n.load("en", messages);
i18n.activate("en");

afterEach(() => {
  cleanup();
});
