import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { Nand16 } from "./builtins/logic/nand.js";
import { And16 } from "./busses.js";
import { Chip, ConstantBus, SubBus, TRUE_BUS } from "./chip.js";

describe("bus logic", () => {
  it("nands 16-bit-wide", () => {
    const nand16 = new Nand16();
    nand16.in("a").busVoltage = 0xf00f;
    nand16.in("b").busVoltage = 0xf0f0;
    nand16.eval();
    expect(nand16.out().busVoltage).toBe(0x0fff);
  });
  it("ands 16-bit-wide busses", () => {
    const and16 = And16();
    and16.in("a").busVoltage = 0x1001;
    and16.in("b").busVoltage = 0x1010;
    and16.eval();
    expect(and16.out().busVoltage).toBe(0x1000);
  });

  it("assigns inside a bus", () => {
    // From figure A2.2, page 287, 2nd edition
    class Not8 extends Chip {
      constructor() {
        super(["in[8]"], ["out[8]"]);
      }

      eval() {
        const inn = this.in().busVoltage;
        const out = ~inn & 0xff;
        this.out().busVoltage = out;
      }
    }
    class Foo extends Chip {
      constructor() {
        super([], []);
        const not8 = new Not8();
        this.parts.add(not8);
        this.pins.insert(new ConstantBus("six", 0b110));
        // in[0..1] = true
        TRUE_BUS.connect(new SubBus(not8.in(), 0, 2));
        // in[3..5] = six, 110
        this.pins.get("six")?.connect(new SubBus(not8.in(), 3, 3));
        // in[7] = true
        TRUE_BUS.connect(new SubBus(not8.in(), 7, 1));
        // out[3..7] = out1
        this.pins.emplace("out1", 5);
        const out1Bus = new SubBus(this.pins.get("out1")!, 3, 5);
        not8.out().connect(out1Bus);
      }
    }

    const foo = new Foo();
    foo.eval();
    expect([...foo.parts][0].in().busVoltage).toBe(0b10110011);
    expect(foo.pin("out1").busVoltage).toBe(0b01001);
  });
});
