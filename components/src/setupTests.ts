import "@testing-library/jest-dom/vitest";
import "@nand2tetris/simulator/setupTests.js";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
