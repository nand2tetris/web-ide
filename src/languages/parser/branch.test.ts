import { Err, Ok } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { alt } from "./branch.js";
import { alpha1, digit1 } from "./character.js";

describe("TS Parser Combinator", () => {
  describe("branch", () => {
    it("branches with alt", () => {
      const parser = alt(alpha1(), digit1());

      expect(parser("abc")).toEqual(Ok(["", "abc"]));
      expect(parser("123456")).toEqual(Ok(["", "123456"]));
      expect(parser(" ")).toEqual(
        Err({
          context: { message: "alt did not match any branches.", span: " " },
          name: "ParseError",
        })
      );
    });
  });
});
