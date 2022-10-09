import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { bin } from "../util/twos.js";
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
            );
          }`
        )
      );
    } catch (e: any) {
      throw new Error(display(e.message ?? e.shortMessage ?? e));
    }
    const six = foo.in("six");
    six.busVoltage = 6;
    foo.eval();
    const inVoltage = [...foo.parts][0].in().busVoltage;
    expect(bin(inVoltage)).toBe(bin(0b10110011));

    // const outVoltage = foo.pin("out1").busVoltage;
    // expect(outVoltage).toBe(0b01001);
    // expect(outVoltage).toBe(0b11001);
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
          Not(in=in[0], out=out[0]);
          Not(in=in[1], out=out[1]);
        }
      `)
      );
    } catch (e: any) {
      throw new Error(display(e.message ?? e.shortMessage ?? e));
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
            out[3..5] = out[1..3],
            );
          }`
        )
      );
    } catch (e: any) {
      throw new Error(display(e.message ?? e.shortMessage ?? e));
    }

    foo.in().busVoltage = 0b1010_1100_0011_0101;
    foo.eval();
    const inVoltage = [...foo.parts][0].in().busVoltage;
    const outVoltage = foo.out().busVoltage;
    expect(bin(inVoltage)).toBe(bin(0b11000011));
    expect(bin(outVoltage)).toBe(bin(0b01110));
  });
});
