import { grammars, valueSemantics } from "./base-ohm";

describe("Ohm Base", () => {
  it("parses numbers", () => {
    const match = grammars.Base.match("1234", "Number");

    expect(match).toHaveSucceeded();
    const { value } = valueSemantics(match);
    expect(value).toBe(1234);
  });

  it("saves names", () => {
    const match = grammars.Base.match("inout", "Name");
    expect(match).toHaveSucceeded();
    const { name } = valueSemantics(match);
    expect(name).toBe("inout");
  });
});
