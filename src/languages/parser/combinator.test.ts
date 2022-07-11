import { isOk, Ok } from "@davidsouther/jiffies/lib/esm/result";
import { IResult, Span, StringLike } from "./base";
import { tag } from "./bytes";
import { recognize } from "./combinator";

describe("Combinator", () => {
  it("recognizes within a span", () => {
    const parser = recognize(tag("aaa"));
    const result: IResult<StringLike> = parser(new Span("aaabbb"));
    expect(isOk(result)).toBe(true);
    const [rest, match] = Ok(result as Ok<[StringLike, StringLike]>);
    expect(rest.toString()).toBe("bbb");
    expect(match.toString()).toBe("aaa");
  });
});
