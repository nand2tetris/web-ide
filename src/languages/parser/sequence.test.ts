import { Err, isErr, Ok } from "@davidsouther/jiffies/src/result";
import { IResult, StringLike } from "./base"
import { tag } from "./bytes"
import {
  delimited,
  pair,
  preceded,
  separated,
  terminated,
  tuple,
} from "./sequence"

describe("Parser sequences", () => {
  describe("tuple", () => {
    it("parses a 1-tuple", () => {
      const parser = tuple(tag("a"));
      let parsed: IResult<[StringLike]>;

      parsed = parser("abcdef");
      expect(parsed).toBeOk(Ok(["bcdef", ["a"]]));
    });
    it("parses a 2-tuple", () => {
      const parser = tuple(tag("a"), tag("b"));
      let parsed: IResult<[StringLike, StringLike]>;

      parsed = parser("abcdef");
      expect(parsed).toBeOk(Ok(["cdef", ["a", "b"]]));
    });

    it("parses a 3-tuple", () => {
      const parser = tuple(tag("a"), tag("b"), tag("c"));
      let parsed: IResult<[StringLike, StringLike, StringLike]>;

      parsed = parser("abcdef");
      expect(parsed).toBeOk(Ok(["def", ["a", "b", "c"]]));
    });
    it("parses a 4-tuple", () => {
      const parser = tuple(tag("a"), tag("b"), tag("c"), tag("d"));
      let parsed: IResult<[StringLike, StringLike, StringLike, StringLike]>;

      parsed = parser("abcdef");
      expect(parsed).toBeOk(Ok(["ef", ["a", "b", "c", "d"]]));
    });
    it("parses a 5-tuple", () => {
      const parser = tuple(tag("a"), tag("b"), tag("c"), tag("d"), tag("e"));
      let parsed: IResult<
        [StringLike, StringLike, StringLike, StringLike, StringLike]
      >;

      parsed = parser("abcdef");
      expect(parsed).toBeOk(Ok(["f", ["a", "b", "c", "d", "e"]]));
    });
  });

  describe("pair", () => {
    it("parses a pair", () => {
      const parser = pair(tag("a"), tag("b"));
      let parsed: IResult<[StringLike, StringLike]>;

      parsed = parser("abc");
      expect(parsed).toBeOk(Ok(["c", ["a", "b"]]));

      parsed = parser("bca");
      expect(isErr(parsed)).toBe(true);
      expect(parsed).toBeErr(
        Err({ name: "ParseError", context: { cause: "tag 'a'" } })
      );
    });
  });

  describe("sequences", () => {
    it("parses a delimited value", () => {
      const parser = delimited(tag("a"), tag("b"), tag("c"));
      let parsed: IResult<StringLike>;

      parsed = parser("abc");
      expect(parsed).toBeOk(Ok(["", "b"]));
    });

    it("parses a preceded value", () => {
      const parser = preceded(tag("a"), tag("b"));
      let parsed: IResult<StringLike>;

      parsed = parser("abc");
      expect(parsed).toBeOk(Ok(["c", "b"]));
    });

    it("parses a terminated value", () => {
      const parser = terminated(tag("a"), tag("b"));
      let parsed: IResult<StringLike>;

      parsed = parser("abc");
      expect(parsed).toBeOk(Ok(["c", "a"]));
    });

    it("parses separated values", () => {
      const parser = separated(tag("a"), tag("b"), tag("c"));
      let parsed: IResult<[StringLike, StringLike]>;

      parsed = parser("abc");
      expect(parsed).toBeOk(Ok(["", ["a", "c"]]));
    });
  });
});
