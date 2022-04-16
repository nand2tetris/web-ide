import { Chip, HIGH, LOW } from "../../chip.js";

export class Mux extends Chip {
  constructor() {
    super(["a", "b", "sel"], ["out"]);
  }

  eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const sel = this.in("sel").voltage();

    const set = sel === 0 ? a : b;

    if (set === 1) {
      this.out().pull(HIGH);
    } else {
      this.out().pull(LOW);
    }
  }
}
