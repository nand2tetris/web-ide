import { display } from "@davidsouther/jiffies/display.js";
import { unwrap } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { parse, TEST_ONLY } from "./builder.js";
import { getBuiltinChip } from "./builtins/index.js";
import { Chip, HIGH, InSubBus, LOW } from "./chip.js";

describe("Chip Builder", () => {
  it("makes wire connections", () => {
    const not16 = unwrap(getBuiltinChip("Not16"));
    {
      const lhs = { pin: "a", start: 0, end: 7 };
      const rhs = { pin: "b", start: 4, end: 11 };

      const toPin = TEST_ONLY.makePin(not16, lhs, TEST_ONLY.PinDirection.LHS);
      const fromPin = TEST_ONLY.makePin(
        not16,
        rhs,
        TEST_ONLY.PinDirection.RHS
      ) as InSubBus;

      expect(toPin).toBe("a");
      expect(fromPin.name).toBe("b");
      expect(fromPin.start).toBe(4);
      expect(fromPin.width).toBe(8);
    }
  });

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

  it("builds and evals a chip with subpins", () => {
    let foo: Chip;
    try {
      foo = unwrap(
        parse(`
        CHIP Not2 {
          IN in[2];
          OUT out[2];
          PARTS:
          //Not(in=in[0], out=out[0]);
          Not(in=in[1], out=out[1]);
        }
      `)
      );
    } catch (e) {
      throw new Error(display(e));
    }

    foo.in().busVoltage = 0b00;
    foo.eval();
    expect(foo.out().busVoltage).toBe(0b11);

    foo.in().busVoltage = 0b11;
    foo.eval();
    expect(foo.out().busVoltage).toBe(0b00);
  });

  it("builds and evals a chip with subbus components on the right", () => {
    let foo: Chip;
    try {
      foo = unwrap(
        parse(
          `CHIP Foo {
          IN in[16];
          OUT out[5];
          PARTS: Not16(
            in[0..7] = in[4..11],
            // in[8..15] = false,
            out[3..7] = out,
            );
          }`
        )
      );
    } catch (e) {
      throw new Error(display(e));
    }

    foo.in().busVoltage = 0b1010_1100_0011_0101;
    foo.eval();
    expect([...foo.parts][0].in().busVoltage).toBe(0b11000011);
    expect(foo.out().busVoltage).toBe(0b00111);
  });
});
