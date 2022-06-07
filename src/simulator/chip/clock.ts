import { assert } from "@davidsouther/jiffies/assert.js";
import { HIGH, LOW } from "./chip.js";

let clock: Clock;
export class Clock {
  private level = LOW;
  private ticks = 0;

  static get() {
    if (clock == undefined) {
      clock = new Clock();
    }
    return clock;
  }

  private constructor() {}

  reset() {
    this.level = LOW;
    this.ticks = 0;
  }

  tick() {
    assert(this.level == LOW, "Can only tick up from LOW");
    this.level = HIGH;
  }

  tock() {
    assert(this.level == HIGH, "Can only tock down from HIGH");
    this.level = LOW;
    this.ticks += 1;
  }

  toggle() {
    if (this.level == HIGH) {
      this.tock();
    } else {
      this.tick();
    }
  }

  eval() {
    this.tick();
    this.tock();
  }

  toString() {
    return `${this.ticks}${this.level == HIGH ? "+" : ""}`;
  }
}
