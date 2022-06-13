import { assert } from "@davidsouther/jiffies/assert.js";
import {
  BehaviorSubject,
  Observable,
  SyncScheduler,
} from "@davidsouther/jiffies/observable/observable.js";
import { Chip, HIGH, LOW, Voltage } from "./chip.js";

interface Tick {
  readonly level: Voltage;
  readonly ticks: number;
}

let clock: Clock;
export class Clock {
  private level: Voltage = LOW;
  private ticks = 0;

  static get() {
    if (clock == undefined) {
      clock = new Clock();
    }
    return clock;
  }

  private subject = new BehaviorSubject<Tick>(
    {
      level: this.level,
      ticks: this.ticks,
    },
    SyncScheduler
  );
  readonly $: Observable<Tick> = this.subject;

  private next() {
    this.subject.next({
      level: this.level,
      ticks: this.ticks,
    });
  }

  private constructor() {}

  reset() {
    this.level = LOW;
    this.ticks = 0;
    this.next();
  }

  tick() {
    assert(this.level == LOW, "Can only tick up from LOW");
    this.next();
    this.level = HIGH;
  }

  tock() {
    assert(this.level == HIGH, "Can only tock down from HIGH");
    this.next();
    this.level = LOW;
    this.ticks += 1;
  }

  toggle() {
    this.level == HIGH ? this.tock() : this.tick();
  }

  eval() {
    this.tick();
    this.tock();
  }

  toString() {
    return `${this.ticks}${this.level == HIGH ? "+" : ""}`;
  }
}

export class ClockedChip extends Chip {
  get clocked(): boolean {
    return true;
  }

  constructor(ins: string[], outs: string[], name?: string) {
    super(ins, outs, name);

    Clock.get().$.subscribe(({ level }) => {
      if (level === LOW) {
        this.tick();
      } else {
        this.tock();
      }
    });
  }
}
