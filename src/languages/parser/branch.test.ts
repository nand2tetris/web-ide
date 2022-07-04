import { Err, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { alt } from "./branch";
import { alpha1, digit1 } from "./character";

describe("TS Parser Combinator", () => {
  describe("branch", () => {
    it("branches with alt", () => {
      const parser = alt(alpha1(), digit1());

      expect(parser("abc")).toBeOk(Ok(["", "abc"]));
      expect(parser("123456")).toBeOk(Ok(["", "123456"]));
      expect(parser(" ")).toBeErr(
        Err({
          context: { message: "alt did not match any branches.", span: " " },
          name: "ParseError",
        })
      );
    });
  });
});
