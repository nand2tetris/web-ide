import { unwrap } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { parse } from "./builder.js";
import { HIGH, LOW } from "./chip.js";

describe("Chip Builder", () => {
  it("builds a chip from a string", () => {
    const nand = unwrap(
      parse(`CHIP Not { IN in; OUT out; PARTS: Nand(a=in, b=in, out=out); }`)
    );

    nand.in().pull(LOW);
    nand.eval();
    expect(nand.out().voltage()).toBe(HIGH);

    nand.in().pull(HIGH);
    nand.eval();
    expect(nand.out().voltage()).toBe(LOW);
  });
});
