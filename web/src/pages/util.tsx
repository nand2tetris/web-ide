import { asm, op } from "@nand2tetris/simulator/util/asm.js";
import {
  bin,
  dec,
  hex,
  int10,
  int16,
  int2,
  uns,
} from "@nand2tetris/simulator/util/twos.js";
import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";

import "./util.scss";

function validBin(value: string) {
  return /^[01]+$/.test(value) && value.length <= 16;
}

function validDec(value: string) {
  return (
    /^-?\d+$/.test(value) && Number(value) <= 32767 && Number(value) >= -32768
  );
}

function validUns(value: string) {
  return /^\d+$/.test(value) && Number(value) <= 65535;
}

function validHex(value: string) {
  return /^[0-9a-fA-F]+$/.test(value) && value.length <= 4;
}

function validAsm(value: string) {
  try {
    op(value);
    return true;
  } catch {
    return false;
  }
}

export const FormattedInput = (props: {
  id: string;
  value?: number;
  setValue: Dispatch<SetStateAction<number | undefined>>;
  setError: Dispatch<SetStateAction<string | undefined>>;
  isValid: (value: string) => boolean;
  parse: (value: string) => number;
  format: (value: number) => string;
}) => {
  const [selected, setSelected] = useState(false);
  const [rawValue, setRawValue] = useState("");

  const onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    if (!selected) {
      return;
    }
    setRawValue(value);
    if (!props.isValid(value)) {
      props.setError("Invalid value");
      props.setValue(undefined);
    } else {
      props.setError(undefined);
      const parsed = props.parse(value);
      props.setValue(parsed);
    }
  };

  return (
    <input
      id="util_setBin"
      type="text"
      value={
        selected
          ? rawValue
          : props.value !== undefined
          ? props.format(props.value)
          : ""
      }
      onChange={onChange}
      onFocus={() => {
        setSelected(true);
        setRawValue(props.value !== undefined ? props.format(props.value) : "");
      }}
      onBlur={() => setSelected(false)}
    />
  );
};

export const Util = () => {
  const [value, setValue] = useState<number | undefined>();
  const [error, setError] = useState<string | undefined>();

  return (
    <article>
      <header>
        <h2>Convert Hack Number Types</h2>
      </header>
      <main>
        <dl>
          <dt>
            <label htmlFor="util_setBin">Binary</label>
          </dt>
          <dd>
            <FormattedInput
              id="util_setBin"
              value={value}
              setValue={setValue}
              setError={setError}
              parse={int2}
              format={bin}
              isValid={validBin}
            />
          </dd>
          <dt>
            <label htmlFor="util_setInt">Decimal</label>
          </dt>
          <dd>
            <FormattedInput
              id="util_setInt"
              value={value}
              setValue={setValue}
              setError={setError}
              parse={int10}
              format={dec}
              isValid={validDec}
            />
          </dd>
          <dt>
            <label htmlFor="util_setUns">Unsigned</label>
          </dt>
          <dd>
            <FormattedInput
              id="util_setUns"
              value={value}
              setValue={setValue}
              setError={setError}
              parse={int10}
              format={uns}
              isValid={validUns}
            />
          </dd>
          <dt>
            <label htmlFor="util_setHex">Hex</label>
          </dt>
          <dd>
            <FormattedInput
              id="util_setHex"
              value={value}
              setValue={setValue}
              setError={setError}
              parse={int16}
              format={hex}
              isValid={validHex}
            />
          </dd>
          <dt>
            <label htmlFor="util_setAsm">HACK ASM</label>
          </dt>
          <dd>
            <FormattedInput
              id="util_setAsm"
              value={value}
              setValue={setValue}
              setError={setError}
              parse={op}
              format={asm}
              isValid={validAsm}
            />
          </dd>
        </dl>
        {error && <p>{error}</p>}
      </main>
    </article>
  );
};

export default Util;
