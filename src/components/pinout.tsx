import { display } from "@davidsouther/jiffies/lib/esm/display";
import { FC } from "react";
import { Pin, Pins } from "../simulator/chip/chip"
import { Clock } from "../simulator/chip/clock"
import { bin } from "../util/twos"

const clock = Clock.get();

export const Pinout: FC<{
  pins: Pins;
  toggle?: (pin: Pin) => void;
  clocked?: boolean;
}> = ({ pins, toggle, clocked = false }) => (
  <table>
    <thead>
      <tr>
        <th tabIndex={0}>Name</th>
        <th tabIndex={0}>Value</th>
      </tr>
    </thead>
    <tbody>
      {clocked ? (
        <tr>
          <td tabIndex={0}>Clock</td>
          <td>
            {(
              [
                [display(clock), () => clock.toggle()],
                ["Tick", () => clock.tick()],
                ["Tock", () => clock.tock()],
                ["Reset", () => clock.reset()],
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
      {[...pins.entries()].map((pin) => (
        <tr key={pin.name}>
          <td tabIndex={0}>{pin.name}</td>
          <td
            style={{ cursor: toggle ? "pointer" : "inherit" }}
            onClick={() => toggle && toggle(pin)}
            onKeyDown={() => toggle && toggle(pin)}
          >
            <code tabIndex={0}>
              {pin.width === 1
                ? pin.voltage() === 0
                  ? "Low"
                  : "High"
                : bin(pin.busVoltage, pin.width)}
            </code>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);