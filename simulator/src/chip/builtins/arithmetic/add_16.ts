import { Chip } from "../../chip.js";

export function add16(a: number, b: number): [number] {
  return [(a + b) & 0xffff];
}

export class Add16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]"], ["out[16]"], "Add16");
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const [out] = add16(a, b);
    this.out().busVoltage = out;
  }
}
