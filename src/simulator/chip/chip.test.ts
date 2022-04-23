import { describe, it, expect } from "@davidsouther/jiffies/scope/index.js";
import {
  Chip,
  DFF,
  Nand,
  parseToPin,
  HIGH,
  LOW,
  printChip,
  Bus,
} from "./chip.js";
import * as make from "./builder.js";

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
        const notChip = make.Not();

        notChip.eval();
        expect(notChip.out().voltage()).toBe(HIGH);

        notChip.in().pull(HIGH);
        notChip.eval();
        expect(notChip.out().voltage()).toBe(LOW);
      });
    });

    describe("and", () => {
      it("evaluates an and gate", () => {
        const andChip = make.And();

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
        const orChip = make.Or();

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
        const xorChip = make.Xor();

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
    });

    describe("and16", () => {});
  });

  describe("arithmetic", () => {
    describe("half adder", () => {
      it("compiles a half adder", () => {
        const halfAdder = new Chip(["a", "b"], ["h", "l"], "HalfAdder");
        // halfAdder.compile(["And(a=a, b=b, out=h)", "Xor(a=a, b=b, out=l)"]);
      });
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
