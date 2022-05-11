import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function xor(a: Voltage, b: Voltage): [Voltage] {
  return [(a == 1 && b == 0) || (a == 0 && b == 1) ? HIGH : LOW];
}

export class Xor extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const [out] = xor(a, b);
    this.out().pull(out);
  }
}
