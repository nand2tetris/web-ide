import { unwrap } from "@davidsouther/jiffies/lib/esm/result.js";
import { Programs } from "@nand2tetris/projects/samples/project_11/index.js";
import { describe, expect, it } from "vitest";
import { JACK } from "./jack.js";

describe("jack language", () => {
  describe.each(Object.keys(Programs))("Program %s", (program) => {
    it.each(Object.keys(Programs[program]))("File %s", (filename) => {
      const parsed = JACK.parse(Programs[program][filename].jack);
      expect(parsed).toBeOk();
      expect(unwrap(parsed)).toEqual(Programs[program][filename].parsed);
    });
  });
});
