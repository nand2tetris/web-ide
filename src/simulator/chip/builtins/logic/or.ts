import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function or(a: Voltage, b: Voltage): [Voltage] {
  return [a == 1 || b == 1 ? HIGH : LOW];
}

export function or8way(a: number): [Voltage] {
  return [(a & 0xff) == 0 ? LOW : HIGH];
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

export class Or8way extends Chip {
  constructor() {
    super(["in[8]"], ["out"], "Or8way");
  }

  eval() {
    const inn = this.in().busVoltage;
    const [out] = or8way(inn);
    this.out().pull(out);
  }
}
