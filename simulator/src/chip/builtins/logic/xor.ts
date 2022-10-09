import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function xor(a: Voltage, b: Voltage): [Voltage] {
  return [(a === HIGH && b === LOW) || (a === LOW && b === HIGH) ? HIGH : LOW];
}

export function xor16(a: number, b: number): [number] {
  return [(a ^ b) & 0xffff];
}

export class Xor extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  override eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const [out] = xor(a, b);
    this.out().pull(out);
  }
}

export class Xor16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]"], ["out[16]"]);
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const [out] = xor16(a, b);
    this.out().busVoltage = out;
  }
}
