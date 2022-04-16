import { Chip, HIGH, LOW } from "../../chip.js";

export class Demux extends Chip {
  constructor() {
    super(["in", "sel"], ["a", "b"]);
  }

  eval() {
    const inn = this.in("in").voltage();
    const sel = this.in("sel").voltage();

    const [a, b] =
      sel === 0
        ? [this.out("a"), this.out("b")]
        : [this.out("a"), this.out("b")];
    b.pull(LOW);
    if (inn === 1) {
      a.pull(HIGH);
    } else {
      a.pull(LOW);
    }
  }
}
