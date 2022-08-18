import { Trans } from "@lingui/macro";
import { Pin as ChipPin, Pins, Voltage } from "../simulator/chip/chip";
import { range } from "@davidsouther/jiffies/lib/esm/range";

import "./pinout.scss";

export interface ImmPin {
  bits: [number, Voltage][];
  pin: ChipPin;
}

export function reducePin(pin: ChipPin) {
  return {
    pin,
    bits: range(0, pin.width)
      .map((i) => [i, pin.voltage(i)] as [number, Voltage])
      .reverse(),
  };
}

export function reducePins(pins: Pins): ImmPin[] {
  return [...pins.entries()].map(reducePin);
}

export const Pinout = ({
  pins,
  toggle,
  allowIncrement = () => false,
}: {
  pins: ImmPin[];
  toggle?: (pin: ChipPin, bit?: number) => void;
  allowIncrement?: (pin: ChipPin) => boolean;
}) => {
  if (pins.length === 0) {
    return <Trans>None</Trans>;
  }
  return (
    <table className="pinout">
      <thead>
        <tr>
          <th>
            <Trans>Name</Trans>
          </th>
          <th>
            <Trans>Value</Trans>
          </th>
        </tr>
      </thead>
      <tbody>
        {[...pins].map((immPin) => (
          <tr key={immPin.pin.name}>
            <td>{immPin.pin.name}</td>
            <td>
              <Pin
                pin={immPin}
                toggle={toggle}
                allowIncrement={allowIncrement}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Pin = ({
  pin,
  toggle,
  allowIncrement,
}: {
  pin: ImmPin;
  toggle: ((pin: ChipPin, bit?: number) => void) | undefined;
  allowIncrement: (pin: ChipPin) => boolean;
}) => {
  return (
    <fieldset role="group">
      {pin.bits.map(([i, v]) => (
        <button
          key={i}
          onClick={() => toggle?.(pin.pin, i)}
          disabled={toggle === undefined}
          data-testid={`pin-${i}`}
        >
          {v}
        </button>
      ))}
      {/* {allowIncrement(pin) ? (
        <button className="increment" onClick={() => toggle?.(pin)}>
          +1
        </button>
      ) : (
        <></>
      )} */}
    </fieldset>
  );
};
