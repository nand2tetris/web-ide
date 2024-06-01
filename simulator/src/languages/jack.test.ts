import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { JACK } from "./jack";

describe("jack language", () => {
  describe.each(Object.keys(Programs))("%s", (program) => {
    it.each(Object.keys(Programs[program]))("%s", (filename) => {
      const parsed = JACK.parse(Programs[program][filename].jack);
      expect(parsed).toBeOk();
      expect(unwrap(parsed)).toEqual(Programs[program][filename].parsed);
    });
  });
});
