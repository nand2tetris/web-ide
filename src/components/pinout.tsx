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

export interface PinoutPins {
  pins: ImmPin[];
  toggle?: (pin: ChipPin, bit?: number) => void;
}

export const FullPinout = (props: {
  ins: PinoutPins;
  outs: PinoutPins;
  internal: PinoutPins;
}) => {
  const inBlock = <PinoutBlock header="Input pins" {...props.ins} />;
  const outBlock = <PinoutBlock header="Output pins" {...props.outs} />;
  const internalBlock = (
    <PinoutBlock header="Internal pins" {...props.internal} />
  );
  return (
    <table className="pinout">
      <tbody>
        {inBlock}
        {outBlock}
        {internalBlock}
      </tbody>
    </table>
  );
};

export const PinoutBlock = (props: PinoutPins & { header: string }) => {
  return (
    <>
      {props.pins.length > 0 && (
        <tr>
          <th colSpan={2}>{props.header}</th>
        </tr>
      )}
      {[...props.pins].map((immPin) => (
        <tr key={immPin.pin.name}>
          <td>{immPin.pin.name}</td>
          <td>
            <Pin pin={immPin} toggle={props.toggle} />
          </td>
        </tr>
      ))}
    </>
  );
};

export const Pinout = ({
  pins,
  toggle,
}: {
  pins: ImmPin[];
  toggle?: (pin: ChipPin, bit?: number) => void;
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
              <Pin pin={immPin} toggle={toggle} />
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
}: {
  pin: ImmPin;
  toggle: ((pin: ChipPin, bit?: number) => void) | undefined;
}) => {
  return (
    <fieldset role="group" style={{ width: `${pin.bits.length}rem` }}>
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
    </fieldset>
  );
};
