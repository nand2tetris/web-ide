import { ChangeEvent, useState } from "react";
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

import "./util.scss";

export const Util = () => {
  const [value, setValue] = useState(0);
  const [asmValue, setAsmValue] = useState("@0");

  const doSetValue =
    (conv: (arg: string) => number) =>
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      value = value === "-" ? "-1" : value;
      const iValue = conv(value);
      setValue(iValue);
      setAsmValue(asm(iValue));
    };

  const setBin = doSetValue(int2);
  const setInt = doSetValue(int10);
  const setUns = doSetValue(int10);
  const setHex = doSetValue(int16);

  const setAsm = ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
    setAsmValue(value);
    setValue(op(value));
  };

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
            <input
              id="util_setBin"
              type="text"
              value={bin(value)}
              onChange={setBin}
            />
          </dd>
          <dt>
            <label htmlFor="util_setInt">Decimal</label>
          </dt>
          <dd>
            <input
              id="util_setInt"
              type="text"
              value={dec(value)}
              onChange={setInt}
            />
          </dd>
          <dt>
            <label htmlFor="util_setUns">Unsigned</label>
          </dt>
          <dd>
            <input
              id="util_setUns"
              type="text"
              value={uns(value)}
              onChange={setUns}
            />
          </dd>
          <dt>
            <label htmlFor="util_setHex">Hex</label>
          </dt>
          <dd>
            <input
              id="util_setHex"
              type="text"
              value={hex(value)}
              onChange={setHex}
            />
          </dd>
          <dt>
            <label htmlFor="util_setAsm">HACK ASM</label>
          </dt>
          <dd>
            <input
              id="util_setAsm"
              type="text"
              value={asmValue}
              onChange={setAsm}
            />
          </dd>
        </dl>
      </main>
    </article>
  );
};

export default Util;
