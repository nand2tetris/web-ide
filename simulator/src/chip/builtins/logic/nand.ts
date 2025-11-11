import { nand16 } from "../../../util/twos.js";
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

export class Nand16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]"], ["out[16]"]);
  }

  override eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    this.out().busVoltage = nand16(a, b);
  }
}
