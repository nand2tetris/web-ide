import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function halfAdder(a: Voltage, b: Voltage): [Voltage, Voltage] {
  const sum = (a === 1 && b === 0) || (a === 0 && b === 1) ? HIGH : LOW;
  const car = a === 1 && b === 1 ? HIGH : LOW;

  return [sum, car];
}

export class HalfAdder extends Chip {
  constructor() {
    super(["a", "b"], ["sum", "carry"]);
  }

  override eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const [sum, carry] = halfAdder(a, b);
    this.out("sum").pull(sum);
    this.out("carry").pull(carry);
  }
}
