import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function or(a: Voltage, b: Voltage): [Voltage] {
  return [a == 1 || b == 1 ? HIGH : LOW];
}

export class Or extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const [out] = or(a, b);
    this.out().pull(out);
  }
}
