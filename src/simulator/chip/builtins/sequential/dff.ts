import { ClockedChip } from "../../clock.js";

export class DFF extends ClockedChip {
  constructor(name?: string) {
    super(["in"], ["out"], name, ["t"]);
  }

  tick() {
    // Read in into t
    let t = this.in().voltage();
    this.pin("t").pull(t);
  }

  tock() {
    // write t into out
    let t = this.pin("t").voltage();
    this.out().pull(t);
  }

  eval() {}
}
