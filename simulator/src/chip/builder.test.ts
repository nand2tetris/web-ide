import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import {
  FileSystem,
  ObjectFileSystemAdapter,
} from "@davidsouther/jiffies/lib/esm/fs.js";
import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { HDL } from "../languages/hdl.js";
import { bin } from "../util/twos.js";
import { build, parse } from "./builder.js";
import { Chip, HIGH, LOW } from "./chip.js";

function asDisplay(e: unknown): string {
  return display(
    (e as { message: string }).message ??
      (e as { shortMessage: string }).shortMessage ??
      e,
  );
}

describe("Chip Builder", () => {
  it("builds a chip from a string", async () => {
    const nand = unwrap(
      await parse(
        `CHIP Not { IN in; OUT out; PARTS: Nand(a=in, b=in, out=out); }`,
      ),
    );

    nand.in().pull(LOW);
    nand.eval();
    expect(nand.out().voltage()).toBe(HIGH);

    nand.in().pull(HIGH);
    nand.eval();
    expect(nand.out().voltage()).toBe(LOW);
  });

  it("builds and evals a chip with subbus components", async () => {
    let foo: Chip;
    try {
      foo = unwrap(
        await parse(
          `CHIP Foo {
          IN six[3];
          OUT out;
          PARTS: Not16(
            in[0..1] = true,
            in[3..5] = six,
            in[7] = true,
            );
          }`,
        ),
      );
    } catch (e) {
      throw new Error(asDisplay(e));
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

  it("builds and evals a chip with subpins", async () => {
    let foo: Chip;
    try {
      foo = unwrap(
        await parse(`
        CHIP Not2 {
          IN in[2];
          OUT out[2];
          PARTS:
          Not(in=in[0], out=out[0]);
          Not(in=in[1], out=out[1]);
        }
      `),
      );
    } catch (e) {
      throw new Error(asDisplay(e));
    }

    foo.in().busVoltage = 0b00;
    foo.eval();
    expect(foo.out().busVoltage).toBe(0b11);

    foo.in().busVoltage = 0b11;
    foo.eval();
    expect(foo.out().busVoltage).toBe(0b00);
  });

  it("builds and evals a chip with subbus components on the right", async () => {
    let foo: Chip;
    try {
      foo = unwrap(
        await parse(
          `CHIP Foo {
          IN in[16];
          OUT out[5];
          PARTS: Not16(
            in[0..7] = in[4..11],
            // in[8..15] = false,
            out[3..5] = out[1..3],
            );
          }`,
        ),
      );
    } catch (e) {
      throw new Error(asDisplay(e));
    }

    foo.in().busVoltage = 0b1010_1100_0011_0101;
    foo.eval();
    const inVoltage = [...foo.parts][0].in().busVoltage;
    const outVoltage = foo.out().busVoltage;
    expect(bin(inVoltage)).toBe(bin(0b11000011));
    expect(bin(outVoltage)).toBe(bin(0b01110));
  });

  it("looks up unknown chips in fs", async () => {
    const fs = new FileSystem(
      new ObjectFileSystemAdapter({ "Copy.hdl": COPY_HDL }),
    );

    let foo: Chip;

    try {
      const chip = unwrap(await HDL.parse(USE_COPY_HDL));
      foo = unwrap(await build({ parts: chip, dir: ".", fs }));
    } catch (e) {
      throw new Error(asDisplay(e));
    }

    foo.in("a").pull(HIGH);
    foo.eval();
    expect(foo.out("b").busVoltage).toBe(1);

    foo.in("a").pull(LOW);
    foo.eval();
    expect(foo.out("b").busVoltage).toBe(0);
  });

  it("returns error for mismatching input width", async () => {
    try {
      const chip = unwrap(
        HDL.parse(`CHIP Foo {
        IN in[3]; OUT out;
        PARTS: Or8Way(in=in, out=out);
      }`),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("returns error for mismatching output width", async () => {
    try {
      const chip = unwrap(
        HDL.parse(`CHIP Foo {
        IN in; OUT out[5];
        PARTS: Not(in=in, out=out);
      }`),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("returns error for wire loop", async () => {
    try {
      const chip = unwrap(
        HDL.parse(`CHIP Not {
        IN in;
        OUT out;
        PARTS:
        Nand(a=in, b=myNand, out=myNand);
      }`),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("returns error for part loop", async () => {
    try {
      const chip = unwrap(
        HDL.parse(`CHIP Not {
        IN in;
        OUT out;
        PARTS:
        Nand(a=in, b=b, out=c);
        Nand(a=in, b=c, out=b);
      }`),
      );
      const foo = await build({ parts: chip });
      expect(foo).toBeErr();
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });

  it("sorts after wiring", async () => {
    try {
      const chip = unwrap(
        HDL.parse(`CHIP Or { IN a, b; OUT out;
  PARTS:
  Not(in =b , out = net2);
  Nand(a = net, b =net2 , out =out );
  Not(in =a , out = net);
}`),
      );
      const orA = await build({ parts: chip });
      expect(orA).toBeOk();

      const ora = unwrap(orA);

      ora.in("a").pull(HIGH);
      ora.in("b").pull(LOW);
      ora.eval();
      expect(ora.out("out").busVoltage).toBe(HIGH);
    } catch (e) {
      throw new Error(asDisplay(e));
    }
  });
});

const USE_COPY_HDL = `CHIP UseCopy {
  IN a; OUT b;
  PARTS: Copy(in=a, out=b);
}`;

const COPY_HDL = `CHIP Copy { 
    IN in; OUT out;
    PARTS: Or(a=in, b=in, out=out);
}`;
