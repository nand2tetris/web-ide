import { Chip, HIGH, LOW } from "../../chip.js";

export class Or extends Chip {
  constructor() {
    super(["a", "b"], ["out"]);
  }

  eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    if (a === 1 || b === 1) {
      this.out().pull(HIGH);
    } else {
      this.out().pull(LOW);
    }
  }
}
