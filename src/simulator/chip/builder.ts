import { Bus, Chip, Nand } from "./chip.js";

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
