import { render, screen } from "@testing-library/react";
import VirtualScroll, { arrayAdapter } from "./virtual_scroll.js";

describe("<VirtualScroll />", () => {
  it("initializes & renders", () => {
    render(
      <VirtualScroll<number>
        settings={{ maxIndex: 3 }}
        get={arrayAdapter([1, 2, 3])}
        row={(i) => <div>{i}</div>}
        rowKey={(i) => i}
      />,
    );

    const two = screen.getByText("2");
    expect(two).toBeVisible();
  });
});
