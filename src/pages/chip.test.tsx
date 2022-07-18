import userEvent from "@testing-library/user-event";
import { cleanState } from "@davidsouther/jiffies/lib/esm/scope/state";
import { AppContext } from "../App.context";
import { render, screen, appContext, fireEvent, waitFor } from "../testing";
import Chip from "./chip";

describe("chip page", () => {
  const state = cleanState(() => ({ context: appContext() }), beforeEach);

  it("tracks the clock", async () => {
    const events = userEvent.setup();
    render(
      <AppContext.Provider value={state.context}>
        <Chip />
      </AppContext.Provider>
    );

    const clock = screen.getByTestId("clock");
    const clockReset = screen.getByTestId("clock-reset");

    expect(clock).toHaveTextContent("Clock: 0");
    await events.click(clock);
    expect(clock).toHaveTextContent("Clock: 0+");
    await events.click(clock);
    expect(clock).toHaveTextContent("Clock: 1");
    await events.click(clockReset);
    expect(clock).toHaveTextContent("Clock: 0");
  });
});
