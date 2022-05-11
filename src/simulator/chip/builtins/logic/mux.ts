import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function mux(a: Voltage, b: Voltage, sel: Voltage): [Voltage] {
  return [sel === 0 ? a : b];
}

export class Mux extends Chip {
  constructor() {
    super(["a", "b", "sel"], ["out"]);
  }

  eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const sel = this.in("sel").voltage();

    const set = mux(a, b, sel);
    if (set) {
      this.out().pull(HIGH);
    } else {
      this.out().pull(LOW);
    }
  }
}
