import { Trans } from "@lingui/macro";
import { Pin as ChipPin } from "../simulator/chip/chip";
import { range } from "@davidsouther/jiffies/lib/esm/range";

import "./pinout.scss";

export interface ImmPin {
  pin: ChipPin;
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
        {[...pins].map(({ pin }) => (
          <tr key={pin.name}>
            <td>{pin.name}</td>
            <td>
              <Pin pin={pin} toggle={toggle} allowIncrement={allowIncrement} />
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
  pin: ChipPin;
  toggle: ((pin: ChipPin, bit?: number) => void) | undefined;
  allowIncrement: (pin: ChipPin) => boolean;
}) => {
  return (
    <fieldset className="button-group">
      {range(0, pin.width)
        .reverse()
        .map((i) => (
          <button
            key={i}
            onClick={() => toggle?.(pin, i)}
            disabled={toggle === undefined}
            data-testid={`pin-${i}`}
          >
            {pin.voltage(i)}
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
