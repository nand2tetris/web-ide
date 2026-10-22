import { describe, expect, it } from "vitest";
import { errorMessage } from "./file_utils.js";

describe("errorMessage", () => {
  it("reads Error messages", () => {
    expect(errorMessage(new Error("boom"))).toBe("boom");
  });
  it("accepts strings and message-bearing objects", () => {
    expect(errorMessage("plain")).toBe("plain");
    expect(errorMessage({ message: "shaped" })).toBe("shaped");
  });
  it("does not throw for undefined or null (fs.stat on a missing path)", () => {
    expect(errorMessage(undefined)).toBe("Unknown error");
    expect(errorMessage(null)).toBe("Unknown error");
    expect(errorMessage(42)).toBe("Unknown error");
  });
});
