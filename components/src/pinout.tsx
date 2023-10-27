// import { plural, Trans } from "@lingui/macro";
import {
  Pin as ChipPin,
  Pins,
  Voltage,
} from "@nand2tetris/simulator/chip/chip.js";
import { range } from "@davidsouther/jiffies/lib/esm/range.js";
import { ChipSim } from "./stores/chip.store.js";
import { createContext, useContext, useEffect, useState } from "react";
import { ChipDisplayInfo, getDisplayInfo } from "./pin_display.js";

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
  setInputValid: (pending: boolean) => void;
  hideInternal?: boolean;
}) => {
  const { inPins, outPins, internalPins } = props.sim;
  const displayInfo = getDisplayInfo(props.sim.chip[0].name ?? "");
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
            setInputValid={props.setInputValid}
            displayInfo={displayInfo}
          />
          <PinoutBlock
            pins={outPins}
            header="Output pins"
            disabled={props.sim.pending}
            enableEdit={false}
            displayInfo={displayInfo}
          />
          {!props.hideInternal && (
            <PinoutBlock
              pins={internalPins}
              header="Internal pins"
              disabled={props.sim.pending}
              enableEdit={false}
              displayInfo={displayInfo}
            />
          )}
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
    setInputValid?: (valid: boolean) => void;
    displayInfo: ChipDisplayInfo;
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
            signed={props.displayInfo.isSigned(immPin.pin.name)}
            setInputValid={props.setInputValid}
            internal={props.header === "Internal pins" ? true : false}
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
              <Pin pin={immPin} toggle={toggle} internal />
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
  signed = true,
  setInputValid,
  internal = false,
}: {
  pin: ImmPin;
  toggle: ((pin: ChipPin, bit?: number) => void) | undefined;
  disabled?: boolean;
  enableEdit?: boolean;
  signed?: boolean;
  setInputValid?: (valid: boolean) => void;
  internal: boolean;
}) => {
  const [isBin, setIsBin] = useState(true);
  let inputValid = true;
  const [decimal, setDecimal] = useState("");

  const toggleBin = () => {
    setIsBin(!isBin);
  };

  const resetDispatcher = useContext(PinContext) as PinResetDispatcher;
  resetDispatcher.registerCallback(() => {
    setIsBin(true);
  });

  const setInputValidity = (valid: boolean) => {
    inputValid = valid;
    setInputValid?.(valid);
  };

  const handleDecimalChange = (value: string) => {
    const positive = value.replace(/[^\d]/g, "");
    const numeric = signed && value[0] === "-" ? `-${positive}` : positive;

    setDecimal(numeric);
    if (isNaN(parseInt(numeric))) {
      setInputValidity(false);
    } else {
      const newValue = parseInt(numeric);
      if (
        (!signed && newValue >= Math.pow(2, pin.bits.length)) ||
        (signed &&
          (newValue >= Math.pow(2, pin.bits.length - 1) ||
            newValue < -Math.pow(2, pin.bits.length - 1)))
      ) {
        setInputValidity(false);
      } else {
        updatePins(newValue);
        setInputValidity(true);
      }
    }
  };

  const updatePins = (n: number) => {
    for (let i = 0; i < pin.bits.length; i++) {
      if (pin.bits[pin.bits.length - i - 1][1] !== ((n >> i) & 1)) {
        toggle?.(pin.pin, i);
      }
    }
  };

  useEffect(() => {
    if (!isBin && inputValid) {
      let value = 0;
      if (signed && pin.bits[0][1]) {
        // negative
        for (const [i, v] of pin.bits) {
          if (i < pin.bits.length - 1 && !v) {
            value += 2 ** i;
          }
        }
        value = -value - 1;
      } else {
        // positive
        const limit = signed ? pin.bits.length - 1 : pin.bits.length;
        for (const [i, v] of pin.bits) {
          if (i < limit && v) {
            value += 2 ** i;
          }
        }
      }
      setDecimal(value.toString());
    }
  }, [pin, isBin]);

  return (
    <div
      style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
    >
      <fieldset role="group" style={{ width: `${pin.bits.length}rem` }}>
        {isBin ? (
          pin.bits.map(([i, v]) => (
            <button
              key={i}
              disabled={disabled}
              style={internal ? { backgroundColor: "grey" } : {}}
              onClick={() => toggle?.(pin.pin, i)}
              data-testid={`pin-${i}`}
            >
              {v}
            </button>
          ))
        ) : (
          <input
            className="colored"
            value={decimal}
            onChange={(e) => {
              handleDecimalChange(e.target.value);
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
