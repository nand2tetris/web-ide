import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function and(a: Voltage, b: Voltage): [Voltage] {
  return [a === 1 && b === 1 ? HIGH : LOW];
}

export function and16(a: number, b: number): [number] {
  return [a & b & 0xffff];
}

export class And extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  override eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const [n] = and(a, b);
    this.out().pull(n);
  }
}

export class And16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]"], ["out[16]"]);
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const [n] = and16(a, b);
    this.out().busVoltage = n;
  }
}
