import { t, Trans } from "@lingui/macro";
import { display } from "@davidsouther/jiffies/lib/esm/display";
import { useEffect, useState } from "react";
import { Pin } from "../simulator/chip/chip";
import { Clock } from "../simulator/chip/clock";
import { bin } from "../util/twos";

const clock = Clock.get();

export interface ImmPin {
  pin: Pin;
}

export const Pinout = ({
  pins,
  toggle,
  clocked = false,
}: {
  pins: ImmPin[];
  toggle?: (pin: Pin) => void;
  clocked?: boolean;
}) => {
  const [clockface, setClockface] = useState(display(clock));

  useEffect(() => {
    const subscription = clock.$.subscribe(() => {
      setClockface(display(clock));
    });
    return () => subscription.unsubscribe();
  });

  return (
    <table>
      <thead>
        <tr>
          <th tabIndex={0}>
            <Trans>Name</Trans>
          </th>
          <th tabIndex={0}>
            <Trans>Value</Trans>
          </th>
        </tr>
      </thead>
      <tbody>
        {clocked ? (
          <tr>
            <td tabIndex={0}>Clock</td>
            <td>
              {(
                [
                  [clockface, () => clock.toggle()],
                  [t`Tick`, () => clock.tick()],
                  [t`Tock`, () => clock.tock()],
                  [t`Reset`, () => clock.reset()],
                ] as [string, () => void][]
              ).map(([label, click]) => (
                <code
                  key={label}
                  style={{
                    cursor: toggle ? "pointer" : "inherit",
                    marginRight: "var(--spacing)",
                  }}
                  onClick={click}
                  role="button"
                >
                  {label}
                </code>
              ))}
            </td>
          </tr>
        ) : (
          <></>
        )}
        {[...pins].map(({ pin }) => (
          <tr key={pin.name}>
            <td tabIndex={0}>{pin.name}</td>
            <td>
              <code
                tabIndex={0}
                role="button"
                style={{ cursor: toggle ? "pointer" : "inherit" }}
                onClick={() => toggle && toggle(pin)}
                onKeyDown={() => toggle && toggle(pin)}
              >
                {pin.width === 1
                  ? pin.voltage() === 0
                    ? t`Low`
                    : t`High`
                  : bin(pin.busVoltage, pin.width)}
              </code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
