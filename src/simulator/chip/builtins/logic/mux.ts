import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function mux(a: Voltage, b: Voltage, sel: Voltage): [Voltage] {
  return [sel === 0 ? a : b];
}

export function mux16(a: number, b: number, sel: Voltage): [number] {
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

export class Mux16 extends Chip {
  constructor() {
    super(["a[16]", "b[16]", "sel"], ["out[16]"]);
  }

  eval() {
    const a = this.in("a").busVoltage;
    const b = this.in("b").busVoltage;
    const sel = this.in("sel").voltage();
    const [out] = mux16(a, b, sel);
    this.out().busVoltage = out;
  }
}
