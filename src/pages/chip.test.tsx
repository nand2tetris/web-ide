import { AppContext } from "../App.context";
import {
  render,
  screen,
  cleanState,
  userEvent,
  useTestingAppContext,
} from "../testing";
import "../components/editor.mock";
import Chip from "./chip";

describe.skip("chip page", () => {
  const state = cleanState(
    () => ({ context: useTestingAppContext() }),
    beforeEach
  );

  it("tracks the clock", async () => {
    const events = userEvent.setup();
    await render(
      <AppContext.Provider value={state.context}>
        <Chip />
      </AppContext.Provider>
    );

    await events.type(
      screen.getByTestId("editor-hdl"),
      `CHIP Foo { IN load; PARTS: CLOCKED load; }`
    );

    await events.click(screen.getByText("Eval"));

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
