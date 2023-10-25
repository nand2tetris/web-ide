// import { plural, Trans } from "@lingui/macro";
import {
  Pin as ChipPin,
  Pins,
  Voltage,
} from "@nand2tetris/simulator/chip/chip.js";
import { range } from "@davidsouther/jiffies/lib/esm/range.js";
import { ChipSim } from "./stores/chip.store.js";

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
    <>
      <style>{`
        table.pinout th {
          font-weight: bold;
        }

        table.pinout tbody td:first-child {
          text-align: right;
          --font-size: 1rem;
          width: 0;
          white-space: nowrap;
          border-right: var(--border-width) solid var(--table-border-color);
        }

        table.pinout tbody button {
          --font-size: 0.875em;
          font-family: var(--font-family-monospace);
          max-width: 2em;
        }
        `}</style>
      <table className="pinout">
        <tbody>
          <PinoutBlock
            pins={inPins}
            header="Input pins"
            toggle={props.toggle}
          />
          <PinoutBlock
            pins={outPins}
            header="Output pins"
            disabled={props.sim.pending}
          />
          <PinoutBlock
            pins={internalPins}
            header="Internal pins"
            disabled={props.sim.pending}
          />
        </tbody>
      </table>
    </>
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
          <Pin pin={immPin} toggle={props.toggle} disabled={props.disabled} internal={props.header === "Internal pins" ? true : false } />
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
    return <>None</>;
  }
  return (
    <table className="pinout">
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {[...pins].map((immPin) => (
          <tr key={immPin.pin.name}>
            <td>{immPin.pin.name}</td>
            <td>
            <Pin pin={immPin} toggle={toggle} internal/>
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
  internal = false
}: {
  pin: ImmPin;
  toggle: ((pin: ChipPin, bit?: number) => void) | undefined;
  disabled?: boolean;
  internal: boolean;
}) => {
  return (
    <fieldset role="group" style={{ width: `${pin.bits.length}rem` }}>
      {pin.bits.map(([i, v]) => (
        <button
          key={i}
          onClick={() => toggle?.(pin.pin, i)}
          disabled={disabled}
          data-testid={`pin-${i}`}
          style={internal ? {backgroundColor: "grey"} : {}}
        >
          {v}
        </button>
      ))}
    </fieldset>
  );
};
