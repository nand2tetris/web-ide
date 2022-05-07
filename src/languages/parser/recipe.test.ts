import { isErr, Ok } from "@davidsouther/jiffies/result.js";
import { describe, expect, it } from "@davidsouther/jiffies/scope/index.js";
import { IResult, StringLike } from "./base.js";
import { comment, eolComment, identifier, list, token } from "./recipe.js";

describe("Parser Recipes", () => {
  describe("comments", () => {
    it("parses EOL comments", () => {
      let parsed: IResult<StringLike>;

      parsed = eolComment("//")("// foo");
      expect(parsed).toEqual(Ok(["", "// foo"]));

      parsed = eolComment("//")("// foo\nnext line");
      expect(parsed).toEqual(Ok(["next line", "// foo\n"]));

      parsed = eolComment("//")("// foo\r\nnext line");
      expect(parsed).toEqual(Ok(["next line", "// foo\r\n"]));
    });

    it("parses multiline comments", () => {
      let parsed: IResult<StringLike>;
      const parser = comment("/*", "*/");

      parsed = parser("/* A multi\nline comment */");
      expect(parsed).toEqual(Ok(["", "/* A multi\nline comment */"]));

      parsed = parser("/** @brief */\nconst foo;");
      expect(parsed).toEqual(Ok(["\nconst foo;", "/** @brief */"]));

      parsed = parser("/* A multi */\nline comment */");
      expect(parsed).toEqual(Ok(["\nline comment */", "/* A multi */"]));
    });
  });

  describe("token", () => {
    it("Ignores space and comments around tokens", () => {
      let parsed: IResult<StringLike>;
      let parser = token(identifier());

      parsed = parser(" item_a   ");
      expect(parsed).toEqual(Ok(["", "item_a"]));

      parsed = parser("item_a   ");
      expect(parsed).toEqual(Ok(["", "item_a"]));

      parsed = parser("  item_a");
      expect(parsed).toEqual(Ok(["", "item_a"]));

      parsed = parser("/* @type */  item_a");
      expect(parsed).toEqual(Ok(["", "item_a"]));

      parsed = parser("item_a // foo");
      expect(parsed).toEqual(Ok(["", "item_a"]));
    });
  });

  describe("list", () => {
    it("parsers a list of identifiers", () => {
      let parsed: IResult<StringLike[]>;

      const idList = list(identifier(), token(","));

      parsed = idList("");
      expect(isErr(parsed)).toBe(true);

      parsed = idList("one_item");
      expect(parsed).toEqual(Ok(["", ["one_item"]]));

      parsed = idList("item_a, item_b");
      expect(parsed).toEqual(Ok(["", ["item_a", "item_b"]]));

      parsed = idList("item_a, item_b,");
      expect(parsed).toEqual(Ok(["", ["item_a", "item_b"]]));

      parsed = idList("item_a, item_b other_content");
      expect(parsed).toEqual(Ok([" other_content", ["item_a", "item_b"]]));
    });
  });
});
