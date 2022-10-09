import { Chip } from "../../chip.js";
import { add16 } from "./add_16.js";

export function inc16(n: number): [number] {
  return add16(n, 1);
}

export class Inc16 extends Chip {
  constructor() {
    super(["in[16]"], ["out[16]"], "Inc16");
  }

  override eval() {
    const a = this.in().busVoltage;
    const [out] = inc16(a);
    this.out().busVoltage = out;
  }
}
