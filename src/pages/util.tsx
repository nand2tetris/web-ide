import { ChangeEventHandler, useState } from "react";
import { asm, op } from "../util/asm";
import { bin, dec, hex, int10, int16, int2 } from "../util/twos";

export const Util = () => {
  const [value, setValue] = useState(0);

  const set =
    (parse: (v: string) => number): ChangeEventHandler<HTMLInputElement> =>
    ({ target: { value } }) => {
      setValue(parse(value));
    };

  return (
    <form>
      <div className="grid">
        <label>
          Binary <input type="text" value={bin(value)} onChange={set(int2)} />
        </label>
        <label>
          Decimal <input type="text" value={dec(value)} onChange={set(int10)} />
        </label>
        <label>
          Hex <input type="text" value={hex(value)} onChange={set(int16)} />
        </label>
        <label>
          HACK ASM <input type="text" value={asm(value)} onChange={set(op)} />
        </label>
      </div>
    </form>
  );
};
