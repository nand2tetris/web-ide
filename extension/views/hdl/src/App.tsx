import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { VSCodeButton, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { makeVisualizationsWithId } from "@computron5k/components/chips/visualizations.js";
import { Clockface } from "@computron5k/components/clockface.js";
import { FullPinout } from "@computron5k/components/pinout.js";
import { useChipPageStore } from "@computron5k/components/stores/chip.store.js";

function App() {
  const { state, actions } = useChipPageStore();

  const [hdl, setHdl] = useState("");

  const compile = useCallback(
    async (hdl: string) => {
      setHdl(hdl);
      await actions.updateFiles({ hdl, tst: "", cmp: "" });
    },
    [setHdl, actions]
  );

  const onMessage = useCallback(
    (event: MessageEvent<unknown>) => {
      compile(event.data as string);
    },
    [compile]
  );

  useEffect(() => {
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [onMessage]);

  const [useBuiltin, setUseBuiltin] = useState(false);
  const toggleUseBuiltin = async () => {
    if (useBuiltin) {
      compile(hdl);
      setUseBuiltin(false);
    } else {
      actions.useBuiltin();
      setUseBuiltin(true);
    }
  };

  const clockActions = useMemo(
    () => ({
      toggle() {
        actions.clock();
      },
      reset() {
        actions.reset();
      },
    }),
    [actions]
  );

  const chipButtons = (
    <fieldset role="group">
      <VSCodeCheckbox onChange={toggleUseBuiltin}>Use Builtin</VSCodeCheckbox>
      <VSCodeButton
        onClick={actions.eval}
        onKeyDown={actions.eval}
        disabled={!state.sim.pending}
      >
        Eval
      </VSCodeButton>
      <VSCodeButton
        onClick={clockActions.toggle}
        style={{ maxWidth: "initial" }}
        disabled={!state.sim.clocked}
      >
        Clock:{"\u00a0"}
        <Clockface />
      </VSCodeButton>
      <VSCodeButton
        onClick={clockActions.reset}
        style={{ maxWidth: "initial" }}
        disabled={!state.sim.clocked}
      >
        Reset
      </VSCodeButton>
    </fieldset>
  );

  const visualizations: [string, ReactNode][] = makeVisualizationsWithId({
    parts: state.sim.chip,
  });

  const pinsPanel = (
    <article>
      <header>
        <div>Chip {state.controls.chipName}</div>
        {chipButtons}
      </header>
      {state.sim.invalid ? (
        <>Invalid Chip</>
      ) : (
        <>
          <FullPinout sim={state.sim} toggle={actions.toggle} />
          <main>
            {visualizations.length > 0 ? (
              visualizations.map(([p, v]) => <div key={p}>{v}</div>)
            ) : (
              <p>None</p>
            )}
          </main>
        </>
      )}
    </article>
  );

  return pinsPanel;
}

export default App;
