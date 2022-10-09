import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function or(a: Voltage, b: Voltage): [Voltage] {
  return [a === 1 || b === 1 ? HIGH : LOW];
}

export function or16(a: number, b: number): [number] {
  return [(a | b) & 0xffff];
}

export function or8way(a: number): [Voltage] {
  return [(a & 0xff) === 0 ? LOW : HIGH];
}

export class Or extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  override eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const [out] = or(a, b);
    this.out().pull(out);
  }
}

export class Or16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]"], ["out[16]"]);
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const [out] = or16(a, b);
    this.out().busVoltage = out;
  }
}

export class Or8way extends Chip {
  constructor() {
    super(["in[8]"], ["out"], "Or8way");
  }

  override eval() {
    const inn = this.in().busVoltage;
    const [out] = or8way(inn);
    this.out().pull(out);
  }
}
