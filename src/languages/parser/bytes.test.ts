import { Err, Ok } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { tag, take } from "./bytes.js";

describe("TS Parser Combinator", () => {
  describe("bytes", () => {
    it("takes bytes", () => {
      const parser = take(6);

      expect(parser("1234567")).toEqual(Ok(["7", "123456"]));
      expect(parser("things")).toEqual(Ok(["", "things"]));
      expect(parser("short")).toEqual(
        Err({ name: "Parse Incomplete", needed: 1 })
      );
    });

    it("consumes tags", () => {
      const parser = tag("Hello");

      expect(parser("Hello, world!")).toEqual(Ok([", world!", "Hello"]));
      expect(parser("Something")).toEqual(Err({ cause: "Hello" }));
    });
  });
});
