import { isErr, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { IResult, Span, StringLike } from "./base";
import { comment, eolComment, identifier, list, token } from "./recipe";

describe("Parser Recipes", () => {
  describe("comments", () => {
    it("parses EOL comments", () => {
      let parsed: IResult<StringLike>;

      parsed = eolComment("//")("// foo");
      expect(parsed).toBeOk(Ok(["", "// foo"]));

      parsed = eolComment("//")("// foo\nnext line");
      expect(parsed).toBeOk(Ok(["next line", "// foo\n"]));

      parsed = eolComment("//")("// foo\r\nnext line");
      expect(parsed).toBeOk(Ok(["next line", "// foo\r\n"]));
    });

    it("parses EOL comments in spans", () => {
      let parsed: IResult<StringLike>;

      parsed = eolComment("//")(new Span("// foo"));
      expect(Ok(parsed)).toMatchObject([
        { start: 6, end: 6 },
        { start: 0, end: 6 },
      ]);

      parsed = eolComment("//")(new Span("// foo\nnext line"));
      expect(Ok(parsed)).toMatchObject([
        { start: 7, end: 16 },
        { start: 0, end: 7 },
      ]);

      parsed = eolComment("//")(new Span("// foo\r\nnext line"));
      expect(Ok(parsed)).toMatchObject([
        { start: 8, end: 17 },
        { start: 0, end: 8 },
      ]);
    });

    it("parses multiline comments", () => {
      let parsed: IResult<StringLike>;
      const parser = comment("/*", "*/");

      parsed = parser("/* A multi\nline comment */");
      expect(parsed).toBeOk(Ok(["", "/* A multi\nline comment */"]));

      parsed = parser("/** @brief */\nconst foo;");
      expect(parsed).toBeOk(Ok(["\nconst foo;", "/** @brief */"]));

      parsed = parser("/* A multi */\nline comment */");
      expect(parsed).toBeOk(Ok(["\nline comment */", "/* A multi */"]));
    });
  });

  describe("token", () => {
    it("Ignores space and comments around tokens", () => {
      let parsed: IResult<StringLike>;
      let parser = token(identifier());

      parsed = parser(" item_a   ");
      expect(parsed).toBeOk(Ok(["", "item_a"]));

      parsed = parser("item_a   ");
      expect(parsed).toBeOk(Ok(["", "item_a"]));

      parsed = parser("  item_a");
      expect(parsed).toBeOk(Ok(["", "item_a"]));

      parsed = parser("/* @type */  item_a");
      expect(parsed).toBeOk(Ok(["", "item_a"]));

      parsed = parser("item_a // foo");
      expect(parsed).toBeOk(Ok(["", "item_a"]));
    });
  });

  describe("list", () => {
    it("parsers a list of identifiers", () => {
      let parsed: IResult<StringLike[]>;

      const idList = list(identifier(), token(","));

      parsed = idList("");
      expect(isErr(parsed)).toBe(true);

      parsed = idList("one_item");
      expect(parsed).toBeOk(Ok(["", ["one_item"]]));

      parsed = idList("item_a, item_b");
      expect(parsed).toBeOk(Ok(["", ["item_a", "item_b"]]));

      parsed = idList("item_a, item_b,");
      expect(parsed).toBeOk(Ok(["", ["item_a", "item_b"]]));

      parsed = idList("item_a, item_b other_content");
      expect(parsed).toBeOk(Ok([" other_content", ["item_a", "item_b"]]));
    });
  });
});
