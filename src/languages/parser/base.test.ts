import { Span } from "./base";

describe("Parser Base", () => {
  describe("Span", () => {
    it("wraps a string", () => {
      const span = new Span("hello world");
      expect(span.toString()).toEqual("hello world");
      expect(span.substring(6).toString()).toEqual("world");
      expect(span.substring(2, 5).toString()).toEqual("llo");
    });

    it("tracks lines and columns", () => {
      const span1 = new Span(`Hello\nbig wide\nworld`);
      expect(span1.start).toBe(0);
      expect(span1.line).toBe(1);
      expect(span1.col).toBe(1);

      const span2 = new Span(span1, 6);
      expect(span2.start).toBe(6);
      expect(span2.line).toBe(2);
      expect(span2.col).toBe(1);

      const span3 = new Span(span2, 4);
      expect(span3.start).toBe(10);
      expect(span3.line).toBe(2);
      expect(span3.col).toBe(5);

      const span4 = new Span(span3, 5);
      expect(span4.start).toBe(15);
      expect(span4.line).toBe(3);
      expect(span4.col).toBe(1);
    });
  });
});
