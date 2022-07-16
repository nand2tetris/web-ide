import { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state";
import { AppContext } from "../App.context";
import { act, render, screen, appContext } from "../testing";
import Chip from "./chip";

describe("chip page", () => {
  const state = cleanState(() => ({ context: appContext() }), beforeEach);
  it.skip("tracks the clock", async () => {
    await render(
      <AppContext.Provider value={state.context}>
        <Chip />
      </AppContext.Provider>
    );

    const clock = screen.getByTestId("clock");
    const clockReset = screen.getByTestId("clock-reset");

    expect(clock.innerText).toBe("Clock: 0");
    act(() => {
      clock.click();
    });
    expect(clock.innerText).toBe("Clock: 0+");
    act(() => {
      clock.click();
    });
    expect(clock.innerText).toBe("Clock: 1");
    act(() => {
      clockReset.click();
    });
    expect(clock.innerText).toBe("Clock: 0");
    expect(screen.getByText("0")).toBeVisible();
  });
});
