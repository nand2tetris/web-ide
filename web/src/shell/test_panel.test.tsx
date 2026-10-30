import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { useContext } from "react";
import { describe, expect, it } from "vitest";
import { AppContext } from "../App.context";
import { render } from "../testing";
import { TestPanel } from "./test_panel";

const NOT_TST = [
  "load Not.hdl,",
  "output-list in out;",
  "set in 0,",
  "evl,",
  "output;",
].join("\n");

function Panel({
  tst,
  attemptRecovery,
}: {
  tst: string;
  attemptRecovery: boolean;
}) {
  const base = useContext(BaseContext);
  const app = useContext(AppContext);
  const ignore = () => undefined;
  return (
    <BaseContext.Provider value={{ ...base, attemptRecovery }}>
      <AppContext.Provider
        value={{ ...app, monaco: { ...app.monaco, wants: false } }}
      >
        <TestPanel
          runner={{ current: undefined }}
          tst={[tst, ignore, undefined]}
          cmp={["", ignore]}
          out={["", ignore]}
        />
      </AppContext.Provider>
    </BaseContext.Provider>
  );
}

const problems = (container: HTMLElement) =>
  [
    ...container.querySelectorAll(
      '[data-testid="editor-tst"] ~ .ErrorPanel li',
    ),
  ].map((item) => item.textContent);

describe("test script Problems", () => {
  it("lists the test script's diagnostics beneath its editor", () => {
    const view = render(<Panel tst={NOT_TST} attemptRecovery={true} />);

    expect(problems(view.container)).toEqual(["Line 4: expected a command"]);
  });

  it("shows only the first problem when recovery is off", () => {
    const view = render(<Panel tst={NOT_TST} attemptRecovery={false} />);

    expect(problems(view.container)).toEqual([
      "First problem: Line 4: expected a command",
    ]);
  });

  it("lists nothing for a script that parses", () => {
    const view = render(
      <Panel tst={NOT_TST.replace("evl", "eval")} attemptRecovery={true} />,
    );

    expect(problems(view.container)).toEqual([]);
  });

  it("lists nothing while no test script is loaded", () => {
    const view = render(<Panel tst="" attemptRecovery={true} />);

    expect(problems(view.container)).toEqual([]);
  });
});
