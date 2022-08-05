import { display } from "@davidsouther/jiffies/lib/esm/display";
import { Trans } from "@lingui/macro";
import { useEffect, useState } from "react";
import { Clock } from "../simulator/chip/clock";

const clock = Clock.get();

export const Clockface = () => {
  const [clockface, setClockface] = useState(display(clock));

  useEffect(() => {
    const subscription = clock.$.subscribe(() => {
      setClockface(display(clock));
    });
    return () => subscription.unsubscribe();
  });

  return (
    <>
      <Trans>Clock:</Trans> {display(clockface)}
    </>
  );
};
