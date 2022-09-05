import { BehaviorSubject, Observable, Subject } from "rxjs";
import { assert } from "@davidsouther/jiffies/lib/esm/assert";
import { HIGH, LOW, Voltage } from "./chip";
import { DependencyList, useEffect, useMemo, useState } from "react";
import { display } from "@davidsouther/jiffies/lib/esm/display";

interface Tick {
  readonly level: Voltage;
  readonly ticks: number;
}

let clock: Clock;
export class Clock {
  private level: Voltage = LOW;
  private ticks = 0;

  static get() {
    if (clock === undefined) {
      clock = new Clock();
    }
    return clock;
  }

  get isHigh(): boolean {
    return this.level === HIGH;
  }

  get isLow(): boolean {
    return this.level === LOW;
  }

  private subject = new BehaviorSubject<Tick>({
    level: this.level,
    ticks: this.ticks,
  });
  readonly frameSubject = new Subject<void>();

  readonly $: Observable<Tick> = this.subject;
  readonly frame$: Observable<void> = this.frameSubject;

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
    assert(this.level === LOW, "Can only tick up from LOW");
    this.level = HIGH;
    this.next();
  }

  tock() {
    assert(this.level === HIGH, "Can only tock down from HIGH");
    this.level = LOW;
    this.ticks += 1;
    this.next();
  }

  toggle() {
    this.level === HIGH ? this.tock() : this.tick();
  }

  eval() {
    this.tick();
    this.tock();
  }

  frame() {
    this.frameSubject.next();
  }

  toString() {
    return `${this.ticks}${this.level === HIGH ? "+" : ""}`;
  }
}

export function useClock(actions: {
  tick?: () => void;
  toggle?: () => void;
  reset?: () => void;
}) {
  const clock = useMemo(() => Clock.get(), []);

  useEffect(() => {
    const subscription = clock.$.subscribe(() => {
      actions.tick?.();
    });
    return () => subscription.unsubscribe();
  }, [actions, clock.$]);

  return {
    toggle() {
      clock.tick();
      actions.toggle?.();
    },

    reset() {
      clock.reset();
      actions.reset?.();
    },
  };
}

export function useClockFrame(
  frameFinished: () => void,
  deps: DependencyList = []
) {
  useEffect(() => {
    const subscription = clock.frame$.subscribe(() => {
      frameFinished();
    });
    return () => subscription.unsubscribe();
  }, deps);
}

export function useClockface() {
  const [clockface, setClockface] = useState(display(clock));

  useEffect(() => {
    const subscription = clock.$.subscribe(() => {
      setClockface(display(clock));
    });
    return () => subscription.unsubscribe();
  }, []);

  return clockface;
}
