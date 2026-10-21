import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function nand(a: Voltage, b: Voltage): [Voltage] {
  return [a === 1 && b === 1 ? LOW : HIGH];
}

export class Nand extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  override eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const [out] = nand(a, b);
    this.out().pull(out);
  }
}
