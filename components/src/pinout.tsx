// import { plural, Trans } from "@lingui/macro";
import {
  Pin as ChipPin,
  Pins,
  Voltage,
} from "@nand2tetris/simulator/chip/chip.js";
import { range } from "@davidsouther/jiffies/lib/esm/range.js";
import { ChipSim } from "./stores/chip.store.js";
import { createContext, useContext, useEffect, useState } from "react";

export const PinContext = createContext({});

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
            enableEdit={false}
          />
          <PinoutBlock
            pins={internalPins}
            header="Internal pins"
            disabled={props.sim.pending}
            enableEdit={false}
          />
        </tbody>
      </table>
    </>
  );
};

export const PinoutBlock = (
  props: PinoutPins & {
    header: string;
    disabled?: boolean;
    enableEdit?: boolean;
  }
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
          <Pin
            pin={immPin}
            toggle={props.toggle}
            disabled={props.disabled}
            enableEdit={props.enableEdit}
          />
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
  enableEdit = true,
}: {
  pin: ImmPin;
  toggle: ((pin: ChipPin, bit?: number) => void) | undefined;
  disabled?: boolean;
  enableEdit?: boolean;
}) => {
  const [isBin, setIsBin] = useState(true);
  const [decimal, setDecimal] = useState(0);

  const toggleBin = () => {
    setIsBin(!isBin);
  };

  const resetDispatcher = useContext(PinContext) as PinResetDispatcher;
  resetDispatcher.registerCallback(() => {
    setIsBin(true);
    setDecimal(0);
  });

  useEffect(() => {
    if (!isBin) {
      let value = 0;
      for (const [i, v] of pin.bits) {
        value += v ? 2 ** i : 0;
      }
      setDecimal(value);
    }
  }, [pin, isBin]);

  const handleDecimalChange = (n: number) => {
    setDecimal(n);

    for (let i = 0; i < pin.bits.length; i++) {
      if (pin.bits[pin.bits.length - i - 1][1] !== ((n >> i) & 1)) {
        toggle?.(pin.pin, i);
      }
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <fieldset role="group" style={{ width: `${pin.bits.length}rem` }}>
        {isBin ? (
          pin.bits.map(([i, v]) => (
            <button
              key={i}
              onClick={() => toggle?.(pin.pin, i)}
              disabled={disabled}
              data-testid={`pin-${i}`}
            >
              {v}
            </button>
          ))
        ) : (
          <input
            type="number"
            className="colored"
            value={decimal}
            onChange={(e) => {
              handleDecimalChange(parseInt(e.target.value));
            }}
            disabled={!enableEdit}
          />
        )}
      </fieldset>
      {pin.bits.length > 1 && (
        <>
          <div style={{ width: "1em" }} />
          <button
            style={{ maxWidth: "3em", margin: 0 }}
            onClick={() => toggleBin()}
          >
            {isBin ? "dec" : "bin"}
          </button>
        </>
      )}
    </div>
  );
};

export class PinResetDispatcher {
  private callbacks: (() => void)[] = [];

  registerCallback(callback: () => void) {
    this.callbacks.push(callback);
  }

  reset() {
    for (const callback of this.callbacks) {
      callback();
    }
  }
}
