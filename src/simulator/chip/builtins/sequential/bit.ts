import { HIGH } from "../../chip.js";
import { ClockedChip } from "../../clock.js";

export class Bit extends ClockedChip {
  constructor(name?: string) {
    super(["in", "load"], ["out"], name);
  }

  tick() {
    if (this.in("load").voltage() === HIGH) {
      this.out().pull(this.in().voltage());
    }
  }
}
