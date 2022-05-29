import { Not, Or } from "../simulator/chip/builtins";
import { Nand } from "../simulator/chip/builtins/logic/nand.js";
import { Chip } from "../simulator/chip/chip.js";

/** Figure A2.1 */
const hdl = `
/** If the three input pins are equal, set out to 1, otherwise 0. */
 CHIP Eq3 {
     IN a, b, c;
     OUT out;
     PARTS:
     Xor(a=a, b=b, out=neq1);        // Xor(a, b) -> neq1
     Xor(a=b, b=c, out=neq2);        // Xor(b, c) -> neq2
     Or (a=neq1, b=neq2, out=outOr); // Or(neq1, neq1) -> outOr
     Not(in=outOr, out=out);         // Not(outOr) -> out
 }
`;

const chip = new Chip(["a", "b", "c"], ["out"]);
chip.wire(new Nand(), [
  { from: "a", to: "a" },
  { from: "b", to: "b" },
  { from: "neq1", to: "out" },
]);
chip.wire(new Nand(), [
  { from: "b", to: "a" },
  { from: "c", to: "b" },
  { from: "neq2", to: "out" },
]);
chip.wire(new Or(), [
  { from: "neq1", to: "a" },
  { from: "neq2", to: "b" },
  { from: "outOr", to: "out" },
]);
chip.wire(new Not(), [
  { from: "outOr", to: "in" },
  { from: "out", to: "out" },
]);

export const eq3 = { hdl, chip };
export default eq3;
