import { LOW, Voltage } from "../../chip.js";
import { ClockedChip } from "../../clock.js";

export class DFF extends ClockedChip {
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

  eval() {}
}
