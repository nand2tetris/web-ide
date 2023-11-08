import { isErr, Ok } from "@davidsouther/jiffies/lib/esm/result.js";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";

export const compare = (cmp: string, out: string) => {
  const cmpResult = CMP.parse(cmp);
  const outResult = CMP.parse(out);

  if (isErr(cmpResult) || isErr(outResult)) {
    return false;
  }

  const cmpData = Ok(cmpResult);
  const outData = Ok(outResult);

  for (let i = 0; i < Math.min(cmpData.length, outData.length); i++) {
    const cmpI = cmpData[i] ?? [];
    const outI = outData[i] ?? [];

    for (let j = 0; j < Math.max(cmpI.length, outI.length); j++) {
      const cmpJ = cmpI[j] ?? "";
      const outJ = outI[j] ?? "";
      if (
        !(cmpJ?.trim().match(/^\*+$/) !== null || outJ?.trim() === cmpJ?.trim())
      ) {
        return false;
      }
    }
  }
  return true;
};
