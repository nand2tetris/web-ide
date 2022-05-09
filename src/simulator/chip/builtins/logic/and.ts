import { Chip, HIGH, LOW } from "../../chip.js";

export class And extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    if (a === 1 && b === 1) {
      this.out().pull(HIGH);
    } else {
      this.out().pull(LOW);
    }
  }
}

export class And16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]"], ["out[16]"]);
  }

  eval() {
    this.out().busVoltage =
      this.in("a").busVoltage & this.in("b").busVoltage & 0xffff;
  }
}
