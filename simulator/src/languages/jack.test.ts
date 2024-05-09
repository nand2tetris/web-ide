import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { Programs } from "@nand2tetris/projects/project_11/index.js";
import { JACK } from "./jack";

describe("compiler", () => {
  it.each(Object.keys(Programs))("%s", (program) => {
    const parsed = JACK.parse(Programs[program].jack);
    expect(parsed).toBeOk();
    expect(unwrap(parsed)).toEqual(Programs[program].parsed);
  });
});
