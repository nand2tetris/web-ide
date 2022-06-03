import { isErr, Ok, Result } from "@davidsouther/jiffies/result.js";
import { HdlParser, PinParts } from "../../languages/hdl.js";
import { ParseError } from "../../languages/parser/base.js";
import { getBuiltinChip } from "./builtins/index.js";
import { Nand } from "./builtins/logic/nand.js";
import { Bus, Chip, Connection, InSubBus, OutSubBus, Pin } from "./chip.js";

export const Not = () => {
  const not = new Chip(["in"], ["out"], "Not");

  not.wire(new Nand(), [
    { from: "in", to: "a" },
    { from: "in", to: "b" },
    { from: "out", to: "out" },
  ]);

  return not;
};

export const Not16 = () => {
  const not16 = new Chip(["in[16]"], ["out[16]"], "Not16");

  not16.wire(Not(), [{ from: new OutSubBus(not16.in(), 0, 1), to: "in" }]);
  not16.wire(Not(), [{ from: new OutSubBus(not16.in(), 1, 1), to: "in" }]);

  return not16;
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

enum PinDirection {
  LHS,
  RHS,
}

function makePin(
  chip: Chip,
  part: PinParts,
  direction: PinDirection
): string | Pin {
  let BusCtor: { new (p: Pin, s: number, w: number): Bus };
  const { pin: name, start, end } = part;
  let width = end ? end - start + 1 : 1;
  let pin: Pin;
  if (chip.ins.has(name)) {
    pin = chip.ins.get(name)!;
    BusCtor = direction == PinDirection.LHS ? InSubBus : OutSubBus;
  } else if (chip.outs.has(name)) {
    pin = chip.outs.get(name)!;
    BusCtor = direction == PinDirection.LHS ? OutSubBus : InSubBus;
  } else {
    pin = chip.pins.emplace(name, width);
    BusCtor = direction == PinDirection.LHS ? InSubBus : OutSubBus;
  }

  // Ensure pin has appropriate width

  return start == 0 && width == pin.width
    ? name
    : new BusCtor(pin, start, width);
}

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
    const partChip = Ok(builtin);

    const wires = part.wires.map<Connection>(({ lhs, rhs }) => {
      const toPin = makePin(partChip, lhs, PinDirection.LHS);
      const fromPin = makePin(partChip, rhs, PinDirection.RHS);

      return { to: toPin, from: fromPin };
    });

    buildChip.wire(partChip, wires);
  }

  return Ok(buildChip);
}

export const TEST_ONLY = {
  makePin,
  PinDirection,
};
