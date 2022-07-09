import { Err, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { tag, take } from "./bytes";

describe("TS Parser Combinator", () => {
  describe("bytes", () => {
    it("takes bytes", () => {
      const parser = take(6);

      expect(parser("1234567")).toBeOk(Ok(["7", "123456"]));
      expect(parser("things")).toBeOk(Ok(["", "things"]));
      expect(parser("short")).toBeErr(
        Err({ name: "Parse Incomplete", needed: 1 })
      );
    });

    it("consumes tags", () => {
      const parser = tag("Hello");

      expect(parser("Hello, world!")).toBeOk(Ok([", world!", "Hello"]));
      expect(parser("Something")).toBeErr(
        Err({ name: "ParseError", context: { cause: "tag 'Hello'" } })
      );
    });
  });
});
