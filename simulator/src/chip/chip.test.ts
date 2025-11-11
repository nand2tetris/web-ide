/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { assertExists } from "@davidsouther/jiffies/lib/esm/assert.js";
import { bin } from "../util/twos.js";
import { And, Inc16, Mux16, Not, Not16, Or, Xor } from "./builtins/index.js";
import { Nand } from "./builtins/logic/nand.js";
import { Bit, PC, Register } from "./builtins/sequential/bit.js";
import { DFF } from "./builtins/sequential/dff.js";
import {
  Bus,
  Chip,
  ConstantBus,
  HIGH,
  InSubBus,
  LOW,
  OutSubBus,
  parseToPin,
  printChip,
  TRUE_BUS,
} from "./chip.js";
import { Clock } from "./clock.js";

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

        const a = assertExists(andChip.in("a"));
        const b = assertExists(andChip.in("b"));

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

        const a = assertExists(orChip.in("a"));
        const b = assertExists(orChip.in("b"));

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

        const a = assertExists(xorChip.in("a"));
        const b = assertExists(xorChip.in("b"));

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

    describe("and16", () => undefined);
  });

  describe("SubBus", () => {
    class Not3 extends Chip {
      constructor() {
        super(["in[3]"], ["out[3]"]);
      }

      override eval() {
        const inn = this.in().busVoltage;
        const out = ~inn & 0b111;
        this.out().busVoltage = out;
      }
    }

    it("drives OutSubBus", () => {
      const notChip = new Not();
      const inPin = new Bus("in", 3);
      const outSubBus = new OutSubBus(notChip.in(), 1, 1);
      inPin.connect(outSubBus);

      inPin.busVoltage = 0b0;
      expect(notChip.in().busVoltage).toBe(0b0);
      inPin.busVoltage = 0b111;
      expect(notChip.in().busVoltage).toBe(0b1);
    });

    it("wires SubBus in=in[1]", () => {
      const not3Chip = new Not3();
      const notPart = new Not();
      const inPin = not3Chip.in();

      not3Chip.wire(notPart, [
        {
          from: { name: "in", start: 1, width: 1 },
          to: { name: "in", start: 0, width: 1 },
        },
      ]);

      inPin.busVoltage = 0b0;
      not3Chip.eval();
      expect(notPart.in().busVoltage).toBe(0b0);
      inPin.busVoltage = 0b111;
      not3Chip.eval();
      expect(notPart.in().busVoltage).toBe(0b1);
    });

    it("wires SubBus in[0]=a", () => {
      const chip = new Chip(["a", "b"], ["out[3]"]);
      const not3 = new Not3();

      // Not3(in[0]=a, in[1]=b, in[2]=b, out=out)
      chip.wire(not3, [
        {
          from: { name: "a", start: 0, width: undefined },
          to: { name: "in", start: 0, width: 1 },
        },
        {
          from: { name: "b", start: 0, width: undefined },
          to: { name: "in", start: 1, width: 1 },
        },
        {
          from: { name: "b", start: 0, width: undefined },
          to: { name: "in", start: 2, width: 1 },
        },
        {
          from: { name: "out", start: 0, width: undefined },
          to: { name: "out", start: 0, width: undefined },
        },
      ]);

      assertExists(chip.in("b")).busVoltage = 1;
      assertExists(chip.in("a")).busVoltage = 0;
      chip.eval();
      expect(chip.out().busVoltage).toBe(0b001);
    });

    it("wires SubBus out=out[1]", () => {
      const threeChip = new (class ThreeChip extends Chip {
        constructor() {
          super([], ["out[3]"]);
        }
      })();

      const notPart = new Not();
      threeChip.wire(notPart, [
        {
          from: { name: "out", start: 1, width: 1 },
          to: { name: "out", start: 0, width: 1 },
        },
      ]);
      const outPin = notPart.out();

      outPin.busVoltage = 0b0;
      expect(threeChip.out().busVoltage).toBe(0b0);
      outPin.busVoltage = 0b1;
      expect(threeChip.out().busVoltage).toBe(0b010);
    });

    it("widens output busses if necessary", () => {
      const mux4way16 = new Chip(
        ["in[16]", "b[16]", "c[16]", "d[16]", "sel[2]"],
        ["out[16]"],
      );

      mux4way16.wire(new Mux16(), [
        {
          from: { name: "a", start: 0 },
          to: { name: "a", start: 0 },
        },
        {
          from: { name: "b", start: 0 },
          to: { name: "b", start: 0 },
        },
        {
          from: { name: "sel", start: 0, width: 1 },
          to: { name: "sel", start: 0 },
        },
        {
          from: { name: "out1", start: 0 },
          to: { name: "out", start: 0 },
        },
      ]);

      mux4way16.wire(new Mux16(), [
        {
          from: { name: "c", start: 0 },
          to: { name: "a", start: 0 },
        },
        {
          from: { name: "d", start: 0 },
          to: { name: "b", start: 0 },
        },
        {
          from: { name: "sel", start: 0, width: 1 },
          to: { name: "sel", start: 0 },
        },
        {
          from: { name: "out2", start: 0 },
          to: { name: "out", start: 0 },
        },
      ]);

      mux4way16.wire(new Mux16(), [
        {
          from: { name: "out1", start: 0 },
          to: { name: "a", start: 0 },
        },
        {
          from: { name: "out2", start: 0 },
          to: { name: "b", start: 0 },
        },
        {
          from: { name: "sel", start: 1, width: 1 },
          to: { name: "sel", start: 0, width: 1 },
        },
        {
          from: { name: "out", start: 0, width: 1 },
          to: { name: "out", start: 0, width: 1 },
        },
      ]);
    });

    it("widens internal busses if necessary", () => {
      const chip = new Chip(["in"], [], "test", ["t"]);

      chip.wire(new Not(), [
        {
          from: { name: "in", start: 0, width: 1 },
          to: { name: "in", start: 0, width: 1 },
        },
        {
          from: { name: "t", start: 1, width: 1 },
          to: { name: "out", start: 0, width: 1 },
        },
      ]);

      chip.in().busVoltage = 0b0;
      chip.eval();
      expect(chip.pin("t").busVoltage).toBe(0b10);
    });

    class Not8 extends Chip {
      constructor() {
        super(["in[8]"], ["out[8]"]);
      }

      override eval() {
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
          this.parts.push(this.not8);
          this.pins.insert(new ConstantBus("pal", 0b1010_1100_0011_0101));
          this.pins.get("pal")?.connect(new OutSubBus(this.not8.in(), 4, 8));
          this.pins.emplace("out1", 5);
          const out1Bus = new OutSubBus(
            assertExists(this.pins.get("out1")),
            3,
            5,
          );
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
          this.parts.push(this.not8);
          this.pins.insert(new ConstantBus("six", 0b110));
          // in[0..1] = true
          TRUE_BUS.connect(new InSubBus(this.not8.in(), 0, 2));
          // in[3..5] = six, 110
          this.pins.get("six")?.connect(new InSubBus(this.not8.in(), 3, 3));
          // in[7] = true
          TRUE_BUS.connect(new InSubBus(this.not8.in(), 7, 1));
          // out[3..7] = out1
          this.pins.emplace("out1", 5);
          const out1Bus = new OutSubBus(
            assertExists(this.pins.get("out1")),
            3,
            5,
          );
          this.not8.out().connect(out1Bus);
        }
      }

      const foo = new Foo();
      foo.eval();
      expect(foo.not8.in().busVoltage).toBe(0b10110011);
      expect(foo.pin("out1").busVoltage).toBe(0b01001);
    });

    it("pulls portions of true", () => {
      class Foo extends Chip {
        readonly chip = new Not3();
        constructor() {
          super([], []);
          this.wire(this.chip, [
            {
              from: { name: "true", start: 0, width: 1 },
              to: { name: "in", start: 1, width: 2 },
            },
          ]);
        }
      }

      const foo = new Foo();

      const inVoltage = foo.chip.in().busVoltage;
      expect(bin(inVoltage)).toBe(bin(0b110));
    });

    it("pulls start of true", () => {
      class Foo extends Chip {
        readonly chip = new Not3();
        constructor() {
          super([], []);
          this.wire(this.chip, [
            {
              from: { name: "true", start: 0, width: 1 },
              to: { name: "in", start: 0, width: 2 },
            },
          ]);
        }
      }

      const foo = new Foo();

      const inVoltage = foo.chip.in().busVoltage;
      expect(bin(inVoltage)).toBe(bin(0b11));
    });
  });

  describe("sequential", () => {
    const clock = Clock.get();
    beforeEach(() => {
      clock.reset();
    });

    describe("dff", () => {
      it("flips and flops", () => {
        clock.reset();
        const dff = new DFF();

        clock.tick(); // Read input, low
        expect(dff.out().voltage()).toBe(LOW);
        clock.tock(); // Write t, low
        expect(dff.out().voltage()).toBe(LOW);

        dff.in().pull(HIGH);
        clock.tick(); // Read input, HIGH
        expect(dff.out().voltage()).toBe(LOW);
        clock.tock(); // Write t, HIGH
        expect(dff.out().voltage()).toBe(HIGH);

        clock.tick();
        expect(dff.out().voltage()).toBe(HIGH);
        clock.tock();
        expect(dff.out().voltage()).toBe(HIGH);
      });
    });

    describe("bit", () => {
      it("does not update when load is low", () => {
        clock.reset();
        const bit = new Bit();

        const inn = bit.in();
        const load = bit.in("load");
        const out = bit.out();

        load.pull(LOW);
        inn.pull(HIGH);
        expect(out.voltage()).toBe(LOW);
        clock.tick();
        expect(out.voltage()).toBe(LOW);
        clock.tock();
        expect(out.voltage()).toBe(LOW);
      });

      it("does updates when load is high", () => {
        clock.reset();
        const bit = new Bit();

        const inn = bit.in();
        const load = bit.in("load");
        const out = bit.out();

        load.pull(HIGH);
        inn.pull(HIGH);
        expect(out.voltage()).toBe(LOW);
        clock.tick();
        expect(out.voltage()).toBe(LOW);
        clock.tock();
        expect(out.voltage()).toBe(HIGH);
      });
    });

    describe("PC", () => {
      it("remains constant when not ticking", () => {
        clock.reset();
        const pc = new PC();
        const out = pc.out();

        expect(out.busVoltage).toBe(0);
        clock.tick();
        expect(out.busVoltage).toBe(0);
        clock.tock();
        expect(out.busVoltage).toBe(0);
        clock.tick();
        expect(out.busVoltage).toBe(0);
        clock.tock();
        expect(out.busVoltage).toBe(0);
      });

      it("increments when ticking", () => {
        clock.reset();
        const pc = new PC();
        const out = pc.out();

        pc.in("inc").pull(HIGH);

        clock.tick();
        expect(out.busVoltage).toBe(0);
        clock.tock();
        expect(out.busVoltage).toBe(1);

        clock.tick();
        expect(out.busVoltage).toBe(1);
        clock.tock();
        expect(out.busVoltage).toBe(2);

        for (let i = 0; i < 10; i++) {
          clock.eval();
          expect(out.busVoltage).toBe(i + 3);
        }
      });

      it("loads a jump value", () => {
        clock.reset();
        const pc = new PC();
        const out = pc.out();

        pc.in().busVoltage = 0x8286;

        expect(out.busVoltage).toBe(0);
        clock.tick();
        expect(out.busVoltage).toBe(0);
        clock.tock();
        expect(out.busVoltage).toBe(0);

        pc.in("load").pull(HIGH);

        expect(out.busVoltage).toBe(0);
        clock.eval();
        expect(out.busVoltage).toBe(0x8286);
      });

      it("resets", () => {
        clock.reset();
        const pc = new PC();
        const out = pc.out();
        pc.in("inc").pull(HIGH);

        expect(out.busVoltage).toBe(0);

        for (let i = 0; i < 10; i++) {
          clock.eval();
        }

        expect(out.busVoltage).toBe(10);

        pc.in("reset").pull(HIGH);

        clock.eval();

        expect(out.busVoltage).toBe(0);
      });
    });
  });

  it("sorts parts before eval", () => {
    class FooA extends Chip {
      readonly notA = new Not();
      readonly notB = new Not();
      constructor() {
        super([], ["out"], "Foo", ["x"]);
        this.wire(this.notA, [
          {
            from: { name: "x", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "out", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
        this.wire(this.notB, [
          {
            from: { name: "true", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "x", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
      }
    }

    const fooA = new FooA();
    fooA.sortParts();
    expect(fooA.parts).toEqual([fooA.notB, fooA.notA]);

    class FooB extends Chip {
      readonly notA = new Not();
      readonly notB = new Not();
      constructor() {
        super([], ["out"], "Foo", ["x"]);
        this.wire(this.notA, [
          {
            from: { name: "true", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "x", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
        this.wire(this.notB, [
          {
            from: { name: "x", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "out", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
      }
    }

    const fooB = new FooB();
    fooB.sortParts();
    expect(fooB.parts).toEqual([fooB.notA, fooB.notB]);
  });

  it("sorts clocked chips", () => {
    class FooC extends Chip {
      readonly register = new Register();
      readonly inc16A = new Inc16();
      readonly inc16B = new Inc16();
      constructor() {
        super([], [], "Foo", []);
        this.wire(this.inc16B, [
          {
            from: { name: "b", start: 0, width: 16 },
            to: { name: "in", start: 0, width: 16 },
          },
          {
            from: { name: "c", start: 0, width: 16 },
            to: { name: "out", start: 0, width: 16 },
          },
        ]);
        this.wire(this.register, [
          {
            from: { name: "c", start: 0, width: 16 },
            to: { name: "in", start: 0, width: 16 },
          },
          {
            from: { name: "true", start: 0, width: 1 },
            to: { name: "load", start: 0, width: 1 },
          },
          {
            from: { name: "a", start: 0, width: 16 },
            to: { name: "out", start: 0, width: 16 },
          },
        ]);
        this.wire(this.inc16A, [
          {
            from: { name: "a", start: 0, width: 16 },
            to: { name: "in", start: 0, width: 16 },
          },
          {
            from: { name: "b", start: 0, width: 16 },
            to: { name: "out", start: 0, width: 16 },
          },
        ]);
      }
    }
    const fooC = new FooC();
    fooC.sortParts();
    const parts = fooC.parts.map((chip) => chip.id);
    expect(parts).toEqual([fooC.register.id, fooC.inc16A.id, fooC.inc16B.id]);
  });

  it("evals without order issues (after sorting)", () => {
    /*
 CHIP Or {
  IN a, b;
  OUT out;

  PARTS:

  Not(in =b , out = net2);
  Nand(a = net, b =net2 , out =out );
  Not(in =a , out = net);
}
  */
    class OrA extends Chip {
      readonly nota = new Not();
      readonly nand = new Nand();
      readonly notb = new Not();
      constructor() {
        super(["a", "b"], ["out"], "OrA", []);
        this.wire(this.nota, [
          {
            from: { name: "b", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "net2", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
        this.wire(this.nand, [
          {
            from: { name: "net", start: 0, width: 1 },
            to: { name: "a", start: 0, width: 1 },
          },
          {
            from: { name: "net2", start: 0, width: 1 },
            to: { name: "b", start: 0, width: 1 },
          },
          {
            from: { name: "out", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
        this.wire(this.notb, [
          {
            from: { name: "a", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "net", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
        this.sortParts();
      }
    }

    class OrB extends Chip {
      readonly nota = new Not();
      readonly nand = new Nand();
      readonly notb = new Not();
      constructor() {
        super(["a", "b"], ["out"], "OrB", []);
        this.wire(this.nota, [
          {
            from: { name: "b", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "net2", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
        this.wire(this.notb, [
          {
            from: { name: "a", start: 0, width: 1 },
            to: { name: "in", start: 0, width: 1 },
          },
          {
            from: { name: "net", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
        this.wire(this.nand, [
          {
            from: { name: "net", start: 0, width: 1 },
            to: { name: "a", start: 0, width: 1 },
          },
          {
            from: { name: "net2", start: 0, width: 1 },
            to: { name: "b", start: 0, width: 1 },
          },
          {
            from: { name: "out", start: 0, width: 1 },
            to: { name: "out", start: 0, width: 1 },
          },
        ]);
      }
    }

    class OrC extends Chip {
      readonly nota = new Not();
      readonly nand = new Nand();
      readonly notb = new Not();
      constructor() {
        super(["a", "b"], ["out"], "OrC", []);
        this.wireAll([
          {
            part: this.nota,
            connections: [
              {
                from: { name: "b", start: 0, width: 1 },
                to: { name: "in", start: 0, width: 1 },
              },
              {
                from: { name: "net2", start: 0, width: 1 },
                to: { name: "out", start: 0, width: 1 },
              },
            ],
          },
          {
            part: this.nand,
            connections: [
              {
                from: { name: "net", start: 0, width: 1 },
                to: { name: "a", start: 0, width: 1 },
              },
              {
                from: { name: "net2", start: 0, width: 1 },
                to: { name: "b", start: 0, width: 1 },
              },
              {
                from: { name: "out", start: 0, width: 1 },
                to: { name: "out", start: 0, width: 1 },
              },
            ],
          },
          {
            part: this.notb,
            connections: [
              {
                from: { name: "a", start: 0, width: 1 },
                to: { name: "in", start: 0, width: 1 },
              },
              {
                from: { name: "net", start: 0, width: 1 },
                to: { name: "out", start: 0, width: 1 },
              },
            ],
          },
        ]);
      }
    }

    const ora = new OrA();
    ora.in("a").pull(HIGH);
    ora.in("b").pull(LOW);
    ora.eval();
    expect(ora.out("out").busVoltage).toBe(HIGH);

    const orb = new OrB();
    orb.in("a").pull(HIGH);
    orb.in("b").pull(LOW);
    orb.eval();
    expect(orb.out("out").busVoltage).toBe(HIGH);

    const orc = new OrC();
    orc.in("a").pull(HIGH);
    orc.in("b").pull(LOW);
    orc.eval();
    expect(orc.out("out").busVoltage).toBe(HIGH);
  });
});
