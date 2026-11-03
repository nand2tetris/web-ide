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

describe("Attempt Recovery option", () => {
  it("shows the current setting", () => {
    render(<Open attemptRecovery={true} setAttemptRecovery={vi.fn()} />);

    expect(screen.getByLabelText("Attempt Recovery")).toBeChecked();
  });

  it("turns the setting off when it is unchecked", async () => {
    const setAttemptRecovery = vi.fn();
    render(
      <Open attemptRecovery={true} setAttemptRecovery={setAttemptRecovery} />,
    );

    await userEvent.setup().click(screen.getByLabelText("Attempt Recovery"));

    expect(setAttemptRecovery).toHaveBeenCalledWith(false);
  });
});
