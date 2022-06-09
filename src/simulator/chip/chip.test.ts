import { describe, it, expect } from "@davidsouther/jiffies/scope/index.js";
import {
  Chip,
  DFF,
  parseToPin,
  HIGH,
  LOW,
  printChip,
  Bus,
  TRUE_BUS,
  ConstantBus,
  InSubBus,
  OutSubBus,
} from "./chip.js";
import { Nand } from "./builtins/logic/nand.js";
import { And, Not, Not16, Or, Xor } from "./builtins/index.js";

describe("Chip", () => {
  it("parses toPin", () => {
    expect(parseToPin("a")).toMatchObject({ pin: "a" });
    expect(parseToPin("a[2]")).toMatchObject({ pin: "a", start: 2 });
    expect(parseToPin("a[2..4]")).toMatchObject({
      pin: "a",
      start: 2,
      end: 4,
    });
  });

  describe("combinatorial", () => {
    describe("nand", () => {
      it("can eval a nand gate", () => {
        const nand = new Nand();
        nand.eval();
        expect(nand.out().voltage()).toBe(HIGH);

        nand.in("a")?.pull(HIGH);
        nand.eval();
        expect(nand.out().voltage()).toBe(HIGH);

        nand.in("b")?.pull(HIGH);
        nand.eval();
        expect(nand.out().voltage()).toBe(LOW);

        nand.in("a")?.pull(LOW);
        nand.eval();
        expect(nand.out().voltage()).toBe(HIGH);
      });
    });

    describe("not", () => {
      it("evaluates a not gate", () => {
        const notChip = new Not();

        notChip.eval();
        expect(notChip.out().voltage()).toBe(HIGH);

        notChip.in().pull(HIGH);
        notChip.eval();
        expect(notChip.out().voltage()).toBe(LOW);
      });
    });

    describe("and", () => {
      it("evaluates an and gate", () => {
        const andChip = new And();

        const a = andChip.in("a")!;
        const b = andChip.in("b")!;

        andChip.eval();
        expect(andChip.out().voltage()).toBe(LOW);

        a.pull(HIGH);
        andChip.eval();
        expect(andChip.out().voltage()).toBe(LOW);

        b.pull(HIGH);
        andChip.eval();
        expect(andChip.out().voltage()).toBe(HIGH);

        a.pull(LOW);
        andChip.eval();
        expect(andChip.out().voltage()).toBe(LOW);
      });
    });

    describe("or", () => {
      it("evaluates an or gate", () => {
        const orChip = new Or();

        const a = orChip.in("a")!;
        const b = orChip.in("b")!;

        orChip.eval();
        expect(orChip.out().voltage()).toBe(LOW);

        a.pull(HIGH);
        orChip.eval();
        printChip(orChip);
        expect(orChip.out().voltage()).toBe(HIGH);

        b.pull(HIGH);
        orChip.eval();
        expect(orChip.out().voltage()).toBe(HIGH);

        a.pull(LOW);
        orChip.eval();
        expect(orChip.out().voltage()).toBe(HIGH);
      });
    });

    describe("xor", () => {
      it("evaluates an xor gate", () => {
        const xorChip = new Xor();

        const a = xorChip.in("a")!;
        const b = xorChip.in("b")!;

        xorChip.eval();
        expect(xorChip.out().voltage()).toBe(LOW);

        a.pull(HIGH);
        xorChip.eval();
        expect(xorChip.out().voltage()).toBe(HIGH);

        b.pull(HIGH);
        xorChip.eval();
        expect(xorChip.out().voltage()).toBe(LOW);

        a.pull(LOW);
        xorChip.eval();
        expect(xorChip.out().voltage()).toBe(HIGH);
      });
    });
  });

  describe("wide", () => {
    describe("Not16", () => {
      it("evaluates a not16 gate", () => {
        const not16 = new Not16();

        const inn = not16.in();

        inn.busVoltage = 0x0;
        not16.eval();
        expect(not16.out().busVoltage).toBe(0xffff);

        inn.busVoltage = 0xf00f;
        not16.eval();
        expect(not16.out().busVoltage).toBe(0x0ff0);
      });
    });

    describe("bus voltage", () => {
      it("sets and returns wide busses", () => {
        const pin = new Bus("wide", 16);
        pin.busVoltage = 0xf00f;
        expect(pin.voltage(0)).toBe(1);
        expect(pin.voltage(8)).toBe(0);
        expect(pin.voltage(9)).toBe(0);
        expect(pin.voltage(15)).toBe(1);
        expect(pin.busVoltage).toBe(0xf00f);
      });

      it("creates wide busses internally", () => {
        const chip = new Chip([], [], "WithWide");

        chip.wire(new Not16(), [
          {
            to: { name: "out", start: 0, width: 16 },
            from: { name: "a", start: 0, width: 16 },
          },
        ]);

        const width = chip.pins.get("a")?.width;
        expect(width).toBe(16);
      });
    });

    describe("and16", () => {});
  });
  describe("SubBus", () => {
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

    it("assigns input inside wide busses", () => {
      class Foo extends Chip {
        readonly not8 = new Not8();
        constructor() {
          super([], []);
          this.parts.add(this.not8);
          this.pins.insert(new ConstantBus("pal", 0b1010_1100_0011_0101));
          this.pins.get("pal")?.connect(new OutSubBus(this.not8.in(), 4, 8));
          this.pins.emplace("out1", 5);
          const out1Bus = new OutSubBus(this.pins.get("out1")!, 3, 5);
          this.not8.out().connect(out1Bus);
        }
      }

      const foo = new Foo();
      foo.eval();
      expect(foo.not8.in().busVoltage).toEqual(0b1100_0011);
      expect(foo.pin("out1")?.busVoltage).toEqual(0b00111);
    });

    it("assigns output inside wide busses", () => {
      // From figure A2.2, page 287, 2nd edition
      class Foo extends Chip {
        readonly not8 = new Not8();
        constructor() {
          super([], []);
          this.parts.add(this.not8);
          this.pins.insert(new ConstantBus("six", 0b110));
          // in[0..1] = true
          TRUE_BUS.connect(new InSubBus(this.not8.in(), 0, 2));
          // in[3..5] = six, 110
          this.pins.get("six")?.connect(new InSubBus(this.not8.in(), 3, 3));
          // in[7] = true
          TRUE_BUS.connect(new InSubBus(this.not8.in(), 7, 1));
          // out[3..7] = out1
          this.pins.emplace("out1", 5);
          const out1Bus = new OutSubBus(this.pins.get("out1")!, 3, 5);
          this.not8.out().connect(out1Bus);
        }
      }

      const foo = new Foo();
      foo.eval();
      expect(foo.not8.in().busVoltage).toBe(0b10110011);
      expect(foo.pin("out1").busVoltage).toBe(0b01001);
    });
  });

  describe("sequential", () => {
    describe("dff", () => {
      it("flips and flops", () => {
        const dff = new DFF();

        dff.tick();
        expect(dff.out().voltage()).toBe(LOW);
        dff.tock();
        expect(dff.out().voltage()).toBe(LOW);

        dff.tick();
        expect(dff.out().voltage()).toBe(LOW);
        dff.in().pull(HIGH);
        dff.tock();
        expect(dff.out().voltage()).toBe(LOW);

        dff.tick();
        expect(dff.out().voltage()).toBe(LOW);
        dff.tock();
        expect(dff.out().voltage()).toBe(HIGH);
      });
    });
  });
});
