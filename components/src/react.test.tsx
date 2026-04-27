import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import { useStateInitializer } from "./react.js";

function Probe({ init }: { init: string }) {
  const [value] = useStateInitializer(init);
  return <div data-testid="probe">{`init=${init}|value=${value}`}</div>;
}

function Harness() {
  const [init, setInit] = useState("a");
  return (
    <>
      <Probe init={init} />
      <button type="button" onClick={() => setInit("b")}>
        change
      </button>
    </>
  );
}

describe("useStateInitializer", () => {
  it("returns the new value on the same render that init changes", () => {
    render(<Harness />);
    expect(screen.getByTestId("probe").textContent).toBe("init=a|value=a");

    act(() => {
      screen.getByText("change").click();
    });

    expect(screen.getByTestId("probe").textContent).toBe("init=b|value=b");
  });
});
