// Repro for #662: `Nand16` is not a course chip but is registered as a builtin, so a
// user's And16.hdl can use it and the project-1 test passes with no real gate wiring.
import { isErr, unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { describe, expect, test } from "vitest";
import { parse } from "../builder.js";
import { hasBuiltinChip } from "./index.js";

describe("#662 Nand16 builtin leakage", () => {
  test("And16 can be 'implemented' with the non-course Nand16 builtin", async () => {
    const chip = await parse(`CHIP And16 {
      IN a[16], b[16]; OUT out[16];
      PARTS:
      Nand16(a=a, b=b, out=n);
      Not16(in=n, out=out);
    }`);
    expect(isErr(chip)).toBe(false); // passes => leak demonstrated
    const c = unwrap(chip);
    c.in("a").busVoltage = 0b1010101010101010;
    c.in("b").busVoltage = 0b1111000011110000;
    c.eval();
    expect(c.out().busVoltage).toBe(0b1010000010100000);
  });

  test("Nand16 should not be resolvable as a builtin (fails at HEAD)", () => {
    expect(hasBuiltinChip("Nand16")).toBe(false);
  });
});
