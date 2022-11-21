import { ChangeEvent, useCallback, useState } from "react";
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

export const Util = () => {
  const [value, setValue] = useState(0);
  const [asmValue, setAsmValue] = useState("@0");

  const binValue = useCallback(() => bin(value), [value]);
  const decValue = useCallback(() => dec(value), [value]);
  const unsValue = useCallback(() => uns(value), [value]);
  const hexValue = useCallback(() => hex(value), [value]);
  // const asmValue = useCallback(() => asm(value), [value]);

  const setBin = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      const ivalue = int2(value);
      setValue(ivalue);
      setAsmValue(asm(ivalue));
    },
    [setValue, setAsmValue]
  );
  const setInt = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      const ivalue = int10(value);
      setValue(ivalue);
      setAsmValue(asm(ivalue));
    },
    [setValue, setAsmValue]
  );
  const setUns = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      const ivalue = int10(value);
      setValue(ivalue);
      setAsmValue(asm(ivalue));
    },
    [setValue, setAsmValue]
  );
  const setHex = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      const ivalue = int16(value);
      setValue(ivalue);
      setAsmValue(asm(ivalue));
    },
    [setValue, setAsmValue]
  );
  const setAsm = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
      setAsmValue(value);
      setValue(op(value));
    },
    [setValue, setAsmValue]
  );

  return (
    <form>
      <div className="grid">
        <label>
          Binary <input type="text" value={binValue()} onChange={setBin} />
        </label>
        <label>
          Decimal <input type="text" value={decValue()} onChange={setInt} />
        </label>
        <label>
          Unsigned
          <input type="text" value={unsValue()} onChange={setUns} />
        </label>
        <label>
          Hex <input type="text" value={hexValue()} onChange={setHex} />
        </label>
        <label>
          HACK ASM
          <input type="text" value={asmValue} onChange={setAsm} />
        </label>
      </div>
    </form>
  );
};

export default Util;
