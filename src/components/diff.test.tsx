import { render, screen } from "@testing-library/react";
import { DiffPanel } from "./diff";

describe("<DiffPanel />", () => {
  it("is empty without a diff run", () => {
    render(<DiffPanel />);

    const header = screen.queryByText(/Failed \d+ assertions/);
    expect(header).toBe(null);
  });

  it("is empty when ran is false", () => {
    render(<DiffPanel ran={false} diffs={[]} />);

    const header = screen.queryByText(/Failed \d+ assertions/);
    expect(header).toBe(null);
  });

  it("shows empty list with no diffs", () => {
    render(<DiffPanel ran={true} diffs={[]} />);

    const header = screen.queryByText(/Failed \d+ assertions/);
    expect(header).toBeVisible();

    const list = screen.queryAllByText(/Expected.*Actual.*at.*/);
    expect(list).toEqual([]);
  });

  it("shows list with a diff", () => {
    render(
      <DiffPanel ran={true} diffs={[{ a: "a", b: "b", row: 0, col: 0 }]} />
    );

    const header = screen.queryByText("Failed 1 assertions");
    expect(header).toBeVisible();

    const list = screen.queryAllByText(/at 0:0/);
    expect(list.length).toBe(1);
  });

  it("shows list with diffs", () => {
    render(
      <DiffPanel
        ran={true}
        diffs={[
          { a: "a", b: "b", row: 0, col: 0 },
          { a: "c", b: "d", row: 5, col: 6 },
        ]}
      />
    );

    const header = screen.queryByText("Failed 2 assertions");
    expect(header).toBeVisible();

    const at00 = screen.queryByText(/at 0:0/);
    expect(at00).toBeVisible();

    const at56 = screen.queryByText(/at 5:6/);
    expect(at56).toBeVisible();
  });
});
