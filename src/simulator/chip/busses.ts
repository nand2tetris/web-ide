import { Not16 } from "./builder.js";
import { Bus, Chip, Nand16 } from "./chip.js";

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
