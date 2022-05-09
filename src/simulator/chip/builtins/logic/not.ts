import { Chip, HIGH, LOW } from "../../chip.js";

export class Not extends Chip {
  constructor() {
    super(["in"], ["out"]);
  }

  eval() {
    const a = this.in("in").voltage();
    if (a === 0) {
      this.out().pull(HIGH);
    } else {
      this.out().pull(LOW);
    }
  }
}

export class Not16 extends Chip {
  constructor() {
    super(["in[16"], ["out[16]"]);
  }

  eval() {
    this.out().busVoltage = ~this.in().busVoltage & 0xffff;
  }
}
