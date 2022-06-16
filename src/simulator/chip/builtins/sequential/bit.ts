import { HIGH, LOW, Voltage } from "../../chip.js";
import { ClockedChip } from "../../clock.js";

export class Bit extends ClockedChip {
  bit: Voltage = LOW;

  constructor(name?: string) {
    super(["in", "load"], ["out"], name);
  }

  tick() {
    if (this.in("load").voltage() === HIGH) {
      this.bit = this.in().voltage();
    }
  }

  tock() {
    this.out().pull(this.bit);
  }
}
