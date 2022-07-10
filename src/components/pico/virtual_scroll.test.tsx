import { render, screen } from "../../testing";
import VirtualScroll, { arrayAdapter } from "./virtual_scroll";

describe("<VirtualScroll />", () => {
  it.skip("initializes & renders", () => {
    render(
      <VirtualScroll<number>
        settings={{ maxIndex: 3 }}
        get={arrayAdapter([1, 2, 3])}
        row={(i) => <div>{i}</div>}
      />
    );

    const two = screen.getByText("2");
    expect(two).toBeVisible();
  });
});
