import { Chip, LOW, Voltage } from "../../chip.js";

export class DFF extends Chip {
  private t: Voltage = LOW;

  constructor() {
    super(["in"], ["out"]);
  }

  tick() {
    // Read in into t
    this.t = this.in().voltage();
  }

  tock() {
    // write t into out
    this.out().pull(this.t);
  }
}
