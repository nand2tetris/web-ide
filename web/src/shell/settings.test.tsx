import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { describe, expect, it, vi } from "vitest";
import { AppContext } from "../App.context";
import { render, screen, userEvent, useTestingAppContext } from "../testing";
import { Settings } from "./settings";

const Open = ({
  attemptRecovery,
  setAttemptRecovery,
}: {
  attemptRecovery: boolean;
  setAttemptRecovery: (value: boolean) => void;
}) => {
  const { base, app } = useTestingAppContext();
  return (
    <BaseContext.Provider
      value={{ ...base, attemptRecovery, setAttemptRecovery }}
    >
      <AppContext.Provider
        value={{ ...app, settings: { ...app.settings, isOpen: true } }}
      >
        <Settings />
      </AppContext.Provider>
    </BaseContext.Provider>
  );
};

describe("Problems display option", () => {
  it.each([false, true])(
    "shows the current choice (all: %s)",
    (attemptRecovery) => {
      render(
        <Open attemptRecovery={attemptRecovery} setAttemptRecovery={vi.fn()} />,
      );

      expect(
        screen.getByRole("radio", { name: "Show First Problem" }),
      ).toHaveProperty("checked", !attemptRecovery);
      expect(
        screen.getByRole("radio", { name: "Show All Problems" }),
      ).toHaveProperty("checked", attemptRecovery);
      expect(
        screen.getByText(
          "Start with Show First Problem to focus on one issue at a time. As you gain confidence, try Show All Problems to see the bigger picture. Fixing one problem may clear other messages too.",
        ),
      ).toBeVisible();
    },
  );

  it("maps both choices to the existing recovery setting", async () => {
    const setAttemptRecovery = vi.fn();
    const view = render(
      <Open attemptRecovery={true} setAttemptRecovery={setAttemptRecovery} />,
    );
    const user = userEvent.setup();

    await user.click(screen.getByRole("radio", { name: "Show First Problem" }));
    expect(setAttemptRecovery).toHaveBeenLastCalledWith(false);

    view.rerender(
      <Open attemptRecovery={false} setAttemptRecovery={setAttemptRecovery} />,
    );
    await user.click(screen.getByRole("radio", { name: "Show All Problems" }));
    expect(setAttemptRecovery).toHaveBeenLastCalledWith(true);
  });
});
