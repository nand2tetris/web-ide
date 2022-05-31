import { isErr, Ok, Result } from "@davidsouther/jiffies/result.js";
import { HdlParser } from "../../languages/hdl.js";
import { ParseError } from "../../languages/parser/base.js";
import { getBuiltinChip } from "./builtins/index.js";
import { Nand } from "./builtins/logic/nand.js";
import { Bus, Chip, InSubBus, OutSubBus, Pin } from "./chip.js";

export const Not = () => {
  const not = new Chip(["in"], ["out"], "Not");

  not.wire(new Nand(), [
    { from: "in", to: "a" },
    { from: "in", to: "b" },
    { from: "out", to: "out" },
  ]);

  return not;
};

export const And = () => {
  const andChip = new Chip(["a", "b"], ["out"], "And");
  const n = new Bus("n");
  andChip.pins.insert(n);
  andChip.wire(new Nand(), [
    { from: "a", to: "a" },
    { from: "b", to: "b" },
    { from: n, to: "out" },
  ]);
  andChip.wire(Not(), [
    { from: n, to: "in" },
    { from: "out", to: "out" },
  ]);

  return andChip;
};

export const Or = () => {
  const orChip = new Chip(["a", "b"], ["out"], "Or");

  const notA = new Bus("notA");
  const notB = new Bus("notB");

  orChip.pins.insert(notA);
  orChip.pins.insert(notB);

  orChip.wire(Not(), [
    { from: "a", to: "in" },
    { from: notA, to: "out" },
  ]);
  orChip.wire(Not(), [
    { from: "b", to: "in" },
    { from: notB, to: "out" },
  ]);
  orChip.wire(new Nand(), [
    { from: notA, to: "a" },
    { from: notB, to: "b" },
    { from: "out", to: "out" },
  ]);

  return orChip;
};

export const Xor = () => {
  const xorChip = new Chip(["a", "b"], ["out"], "Xor");

  const notA = new Bus("notA");
  const notB = new Bus("notB");
  const aAndNotB = new Bus("aAndNotB");
  const notAAndB = new Bus("notAAndB");

  xorChip.pins.insert(notA);
  xorChip.pins.insert(notB);
  xorChip.pins.insert(aAndNotB);
  xorChip.pins.insert(notAAndB);

  xorChip.wire(Not(), [
    { from: "a", to: "in" },
    { from: notA, to: "out" },
  ]);
  xorChip.wire(Not(), [
    { from: "b", to: "in" },
    { from: notB, to: "out" },
  ]);
  xorChip.wire(And(), [
    { from: "a", to: "a" },
    { from: notB, to: "b" },
    { from: aAndNotB, to: "out" },
  ]);
  xorChip.wire(And(), [
    { from: notA, to: "a" },
    { from: "b", to: "b" },
    { from: notAAndB, to: "out" },
  ]);
  xorChip.wire(Or(), [
    { from: aAndNotB, to: "a" },
    { from: notAAndB, to: "b" },
    { from: "out", to: "out" },
  ]);

  return xorChip;
};

export function parse(code: string): Result<Chip, Error | ParseError> {
  const parsed = HdlParser(code);
  if (isErr(parsed)) return parsed;
  const [_, parts] = Ok(parsed);

  if (parts.parts === "BUILTIN") {
    return getBuiltinChip(parts.name);
  }

  const ins = parts.ins.map(({ pin, start }) => ({
    pin,
    start: start == 0 ? 1 : start,
  }));
  const outs = parts.outs.map(({ pin, start }) => ({
    pin,
    start: start == 0 ? 1 : start,
  }));

  const buildChip = new Chip(ins, outs, parts.name);

  for (const part of parts.parts) {
    const builtin = getBuiltinChip(part.name);
    if (isErr(builtin)) return builtin;
    const chip = Ok(builtin);
    const wires = part.wires.map(({ lhs, rhs }) => {
      const { pin: pinName, start, end } = lhs;
      let pin: Pin;
      let BusCtor: { new (p: Pin, s: number, w: number): Bus };

      if (chip.ins.has(pinName)) {
        pin = chip.ins.get(pinName)!;
        BusCtor = InSubBus;
      } else if (chip.outs.has(pinName)) {
        pin = chip.outs.get(pinName)!;
        BusCtor = OutSubBus;
      } else {
        throw new Error(`Missing pin on part ${part.name}`);
      }
      const width = end ? end - start + 1 : 1;
      if (start == 0 && width == pin.width) {
        return { to: pinName, from: rhs };
      }
      return {
        to: new BusCtor(pin, start, width),
        from: rhs,
      };
    });
    buildChip.wire(chip, wires);
  }

  return Ok(buildChip);
}
