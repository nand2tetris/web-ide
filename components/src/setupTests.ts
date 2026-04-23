import "@testing-library/jest-dom/vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";
import "@nand2tetris/simulator/setupTests.js";

expect.extend(matchers);
