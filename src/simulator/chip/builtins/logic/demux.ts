import { Chip, HIGH, LOW, Voltage } from "../../chip.js";

export function demux(inn: Voltage, sel: Voltage): [Voltage, Voltage] {
  const a = sel == LOW && inn == HIGH ? HIGH : LOW;
  const b = sel == HIGH && inn == HIGH ? HIGH : LOW;
  return [a, b];
}

export class Demux extends Chip {
  constructor() {
    super(["in", "sel"], ["a", "b"]);
  }

  eval() {
    const inn = this.in("in").voltage();
    const sel = this.in("sel").voltage();

    const [a, b] = demux(inn, sel);
    this.out("a").pull(a);
    this.out("b").pull(b);
  }
}
