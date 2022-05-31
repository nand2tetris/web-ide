import { display } from "@davidsouther/jiffies/display.js";
import { unwrap } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { parse } from "./builder.js";
import { Chip, HIGH, LOW } from "./chip.js";

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

  it("builds and evals a chip with subbus components", () => {
    let foo: Chip;
    try {
      foo = unwrap(
        parse(
          `CHIP Foo {
          IN six[3];
          OUT out;
          PARTS: Not16(
            in[0..1] = true,
            in[3..5] = six,
            in[7] = true,
            // in[8..15] = false,
            out[3..7] = out1,
            );
          }`
        )
      );
    } catch (e) {
      throw new Error(display(e));
    }

    foo.in("six").busVoltage = 6;
    foo.eval();
    expect([...foo.parts][0].in().busVoltage).toBe(0b10110011);
    expect(foo.pin("out1").busVoltage).toBe(0b01001);
  });
});
