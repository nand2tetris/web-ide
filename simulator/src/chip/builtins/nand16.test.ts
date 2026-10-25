// Regression for #662: `Nand16` is not a course chip, so it must not be a builtin;
// otherwise And16.hdl can be "implemented" with no real gate wiring.
import { isErr } from "@davidsouther/jiffies/result.ts";
import { describe, expect, test } from "vitest";
import { parse } from "../builder.js";
import { hasBuiltinChip } from "./index.js";

describe("#662 Nand16 is not a builtin", () => {
  test("Nand16 is not registered", () => {
    expect(hasBuiltinChip("Nand16")).toBe(false);
  });

  test("And16 built from Nand16 fails with an unknown chip error", async () => {
    const chip = await parse(`CHIP And16 {
      IN a[16], b[16]; OUT out[16];
      PARTS:
      Nand16(a=a, b=b, out=n);
      Not16(in=n, out=out);
    }`);
    expect(isErr(chip)).toBe(true);
  });
});
