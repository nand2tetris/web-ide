import { Nand16 } from "./builtins/logic/nand.js";
import { Bus, Chip } from "./chip.js";

export const Not16 = () => {
  const not = new Chip(["in[16]"], ["out[16]"], "Not16");

  not.wire(new Nand16(), [
    { from: "in", to: "a" },
    { from: "in", to: "b" },
    { from: "out", to: "out" },
  ]);

  return not;
};

export const And16 = () => {
  const andChip = new Chip(["a[16]", "b[16]"], ["out[16]"], "And");
  const n = new Bus("n", 16);
  andChip.pins.insert(n);
  andChip.wire(new Nand16(), [
    { from: "a", to: "a" },
    { from: "b", to: "b" },
    { from: n, to: "out" },
  ]);
  andChip.wire(Not16(), [
    { from: n, to: "in" },
    { from: "out", to: "out" },
  ]);

  return andChip;
};
