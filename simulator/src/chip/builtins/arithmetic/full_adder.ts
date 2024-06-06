import { Chip, Voltage } from "../../chip.js";
import { or } from "../logic/or.js";
import { halfAdder } from "./half_adder.js";

export function fullAdder(
  a: Voltage,
  b: Voltage,
  c: Voltage,
): [Voltage, Voltage] {
  const [s, ca] = halfAdder(a, b);
  const [sum, cb] = halfAdder(s, c);
  const [carry] = or(ca, cb);

  return [sum, carry];
}

export class FullAdder extends Chip {
  constructor() {
    super(["a", "b", "c"], ["sum", "carry"]);
  }

  override eval() {
    const a = this.in("a").voltage();
    const b = this.in("b").voltage();
    const c = this.in("c").voltage();
    const [sum, carry] = fullAdder(a, b, c);
    this.out("sum").pull(sum);
    this.out("carry").pull(carry);
  }
}
