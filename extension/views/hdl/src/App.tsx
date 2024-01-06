import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { VSCodeButton, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import * as Not from "@nand2tetris/projects/project_01/01_not.js";
import { makeVisualizationsWithId } from "@nand2tetris/components/chips/visualizations.js";
import { Clockface } from "@nand2tetris/components/clockface.js";
import { FullPinout } from "@nand2tetris/components/pinout.js";
import { useChipPageStore } from "@nand2tetris/components/stores/chip.store.js";
import { VSCodeContext } from "./vscode";

function App() {
  const { state, actions, dispatch } = useChipPageStore();
  const { api } = useContext(VSCodeContext);

  useEffect(() => {
    actions.initialize();
  }, [actions]);

  const [hdl, setHdl] = useState(Not.hdl);
  const [loaded, setLoaded] = useState(false);

  const compile = useCallback(
    async (hdl: string) => {
      setHdl(hdl);
      await actions.updateFiles({ hdl, tst: "// No test", cmp: "" });
    },
    [setHdl, actions]
  );

  const onMessage = useCallback(
    (
      event: MessageEvent<
        Partial<{ nand2tetris: boolean; hdl: string; chipName: string }>
      >
    ) => {
      if (!event.data?.nand2tetris) return;
      if (event.data.hdl) compile(event.data.hdl ?? "");
      if (event.data.chipName)
        dispatch.current({
          action: "updateChip",
          payload: {
            chipName: event.data.chipName,
          },
        });
      setLoaded(true);
    },
    [compile, dispatch]
  );

  useEffect(() => {
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [onMessage]);

  useEffect(() => {
    api.postMessage({ nand2tetris: true, ready: true });
  }, [api]);

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

  const chipButtons = state.controls.error ? (
    <p>{state.controls.error?.message}</p>
  ) : (
    <>
      <VSCodeCheckbox onChange={toggleUseBuiltin}>Use Builtin</VSCodeCheckbox>
      <fieldset role="group">
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
    </>
  );

  const visualizations: [string, ReactNode][] = makeVisualizationsWithId({
    parts: state.sim.chip,
  });

  const pinsPanel = (
    <>
      <h3>Chip {state.controls.chipName}</h3>
      {chipButtons}
      {state.sim.invalid ? (
        <p>Invalid Chip</p>
      ) : (
        <>
          <FullPinout
            sim={state.sim}
            toggle={actions.toggle}
            setInputValid={() => {
              console.log("TODO: Handle Input Valid");
            }}
          />
          <h4>Visualizations</h4>
          {visualizations.length > 0 ? (
            visualizations.map(([p, v]) => <div key={p}>{v}</div>)
          ) : (
            <p>None</p>
          )}
        </>
      )}
      {/* DEBUG  */}
      <textarea style={{ display: "none" }}>{hdl}</textarea>
    </>
  );

  return loaded ? (
    pinsPanel
  ) : (
    <>
      <h3>HDL</h3>
      <p>Open an HDL chip to begin</p>
    </>
  );
}

export default App;
