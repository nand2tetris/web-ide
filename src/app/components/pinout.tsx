import { plural, Trans } from "@lingui/macro";
import { Pin as ChipPin, Pins, Voltage } from "../../simulator/chip/chip";
import { range } from "@davidsouther/jiffies/lib/esm/range";

import "./pinout.scss";
import { ChipSim } from "../pages/chip.store";

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
  sim: ChipSim;
  toggle: (pin: ChipPin, i: number | undefined) => void;
}) => {
  const { inPins, outPins, internalPins } = props.sim;
  return (
    <table className="pinout">
      <tbody>
        <PinoutBlock
          pins={inPins}
          header={plural(inPins.length, {
            one: "Input pin",
            other: "Input pins",
          })}
          toggle={props.toggle}
        />
        <PinoutBlock
          pins={outPins}
          header={plural(outPins.length, {
            one: "Output pin",
            other: "Output pins",
          })}
          disabled={props.sim.pending}
        />
        <PinoutBlock
          pins={internalPins}
          header={plural(internalPins.length, {
            one: "Internal pin",
            other: "Internal pins",
          })}
          disabled={props.sim.pending}
        />
      </tbody>
    </table>
  );
};

export const PinoutBlock = (
  props: PinoutPins & { header: string; disabled?: boolean }
) => (
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
          <Pin pin={immPin} toggle={props.toggle} disabled={props.disabled} />
        </td>
      </tr>
    ))}
  </>
);

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
  disabled = false,
}: {
  pin: ImmPin;
  toggle: ((pin: ChipPin, bit?: number) => void) | undefined;
  disabled?: boolean;
}) => {
  return (
    <fieldset role="group" style={{ width: `${pin.bits.length}rem` }}>
      {pin.bits.map(([i, v]) => (
        <button
          key={i}
          onClick={() => toggle?.(pin.pin, i)}
          disabled={disabled}
          data-testid={`pin-${i}`}
        >
          {v}
        </button>
      ))}
    </fieldset>
  );
};
