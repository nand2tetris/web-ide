import { Span } from "./base"

describe("Parser Base", () => {
  describe("Span", () => {
    it("wraps a string", () => {
      const span = new Span("hello world");
      expect(span.toString()).toEqual("hello world");
      expect(span.substring(6).toString()).toEqual("world");
      expect(span.substring(2, 5).toString()).toEqual("llo");
    });

    it("tracks lines and columns", () => {
      let span = new Span(`Hello\nbig wide\nworld`);
      expect(span.pos).toBe(0);
      expect(span.line).toBe(1);
      expect(span.col).toBe(1);

      span = new Span(span, 6);
      expect(span.pos).toBe(6);
      expect(span.line).toBe(2);
      expect(span.col).toBe(1);

      span = new Span(span, 4);
      expect(span.pos).toBe(10);
      expect(span.line).toBe(2);
      expect(span.col).toBe(5);

      span = new Span(span, 5);
      expect(span.pos).toBe(15);
      expect(span.line).toBe(3);
      expect(span.col).toBe(1);
    });
  });
});
