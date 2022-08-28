import { ChangeEventHandler, useCallback, useState } from "react";
import { asm, op } from "../../util/asm";
import { bin, dec, hex, int10, int16, int2, uns } from "../../util/twos";

export const Util = () => {
  const [value, setValue] = useState(0);

  const binValue = useCallback(() => bin(value), [value]);
  const decValue = useCallback(() => dec(value), [value]);
  const unsValue = useCallback(() => uns(value), [value]);
  const hexValue = useCallback(() => hex(value), [value]);
  const asmValue = useCallback(() => asm(value), [value]);

  const set =
    (parse: (v: string) => number): ChangeEventHandler<HTMLInputElement> =>
    ({ target: { value } }) => {
      setValue(parse(value));
    };

  return (
    <form>
      <div className="grid">
        <label>
          Binary <input type="text" value={binValue()} onChange={set(int2)} />
        </label>
        <label>
          Decimal <input type="text" value={decValue()} onChange={set(int10)} />
        </label>
        <label>
          Unsigned{" "}
          <input type="text" value={unsValue()} onChange={set(int10)} />
        </label>
        <label>
          Hex <input type="text" value={hexValue()} onChange={set(int16)} />
        </label>
        <label>
          HACK ASM <input type="text" value={asmValue()} onChange={set(op)} />
        </label>
      </div>
    </form>
  );
};

export default Util;
