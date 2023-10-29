import { useEffect, useMemo, useState } from "react";

import { display } from "@davidsouther/jiffies/lib/esm/display.js";
import { Clock } from "@nand2tetris/simulator/chip/clock.js";

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

export function useClockFrame(frameFinished: () => void) {
  useEffect(() => {
    const subscription = Clock.get().frame$.subscribe(() => {
      frameFinished();
    });
    return () => subscription.unsubscribe();
  }, [frameFinished]);
}

export function useClockReset(reset: () => void) {
  useEffect(() => {
    const subscription = Clock.get().reset$.subscribe(() => {
      reset();
    });
    return () => subscription.unsubscribe();
  }, [reset]);
}

export function displayClock() {
  return display(Clock.get());
}

export function useClockface() {
  const [clockface, setClockface] = useState(displayClock());

  useEffect(() => {
    const subscription = Clock.get().$.subscribe(() => {
      setClockface(displayClock());
    });
    return () => subscription.unsubscribe();
  }, []);

  return clockface;
}

export const Clockface = () => {
  const clockface = useClockface();
  return <span style={{ whiteSpace: "nowrap" }}>{clockface}</span>;
};
