import * as VMLang from "@nand2tetris/simulator/languages/vm.js";
import { Keyboard } from "@nand2tetris/components/chips/keyboard.js";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { useVmPageStore } from "@nand2tetris/components/stores/vm.store.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "src/App.context";
import { Panel } from "../shell/panel";
import { TestPanel } from "../shell/test_panel";
import "./vm.scss";
import { Trans } from "@lingui/macro";

const VM = () => {
  const { state, actions, dispatch } = useVmPageStore();
  const { toolStates } = useContext(AppContext);

  const [tst, setTst] = useState("repeat {\n\tvmstep;\n}");
  const [out, setOut] = useState("");
  const [cmp, setCmp] = useState("");

  useEffect(() => {
    toolStates.setTool("vm");
  }, []);

  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnersAssigned] = useState(false);
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      override async tick() {
        actions.step();
        return false;
      }

      override finishFrame() {
        dispatch.current({ action: "update" });
      }

      override reset() {
        actions.reset();
      }

      override toggle() {
        dispatch.current({ action: "update" });
      }
    })();
    setRunnersAssigned(true);

    return () => {
      runner.current?.stop();
    };
  }, [actions, dispatch]);

  const fileUploadRef = useRef<HTMLInputElement>(null);

  const loadProgram = () => {
    fileUploadRef.current?.click();
  };

  const { setStatus } = useContext(BaseContext);
  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      setStatus("No file selected");
      return;
    }
    setStatus("Loading");
    const file = event.target.files[0];
    const source = await file.text();

    if (!file.name.endsWith(".vm")) {
      setStatus("File must be .vm file");
      return;
    }
    actions.loadVm(source);
    setStatus("Loaded vm file");
  };

  return (
    <div className="Page VmPage grid">
      <Panel
        className="program"
        header={
          <>
            <Trans>Program</Trans>
            <input
              type="file"
              style={{ display: "none" }}
              ref={fileUploadRef}
              onChange={uploadFile}
            />
            <button
              className="flex-0"
              onClick={loadProgram}
              data-tooltip="Load file"
              data-placement="bottom"
            >
              📂
            </button>
          </>
        }
      >
        <main>
          <table>
            <thead>
              <tr>
                <td>Inst</td>
                <td>Target</td>
                <td>Val</td>
              </tr>
            </thead>
            <tbody>
              {state.vm.Prog.map((inst, key) =>
                VMInstructionRow({
                  inst,
                  key,
                  highlighted: key === state.vm.highlight,
                })
              )}
            </tbody>
          </table>
        </main>
      </Panel>
      <Panel className="IO">
        <div>
          <label>
            <input
              type="checkbox"
              onChange={actions.toggleUseTest}
              checked={state.test.useTest}
              role="switch"
            />
            Use Test Script
          </label>
        </div>
        <Screen memory={state.vm.Screen} />
        <Keyboard keyboard={state.vm.Keyboard} />
        <div>
          {state.vm.Stack.map((frame, i) => (
            <section key={i}>
              <header>
                <h3>
                  Function
                  <code>{frame.fn?.name ?? "Unknown Function"}</code>
                </h3>
              </header>
              <main>
                <p>
                  <em>Args:</em>
                  <code>[{frame.args.values.join(", ")}]</code>
                </p>
                <p>
                  <em>Locals:</em>
                  <code>[{frame.locals.values.join(", ")}]</code>
                </p>
                <p>
                  <em>Stack:</em>
                  <code>[{frame.stack.values.join(", ")}]</code>
                </p>
              </main>
            </section>
          ))}
        </div>
      </Panel>
      {runnerAssigned && (
        <TestPanel
          runner={runner}
          tst={[tst, setTst, state.test.highlight]}
          out={[out, setOut]}
          cmp={[cmp, setCmp]}
        />
      )}
    </div>
  );
};

export default VM;

export function VMInstructionRow({
  inst,
  key,
  highlighted,
}: {
  inst: VMLang.VmInstruction;
  key: number;
  highlighted: boolean;
}) {
  switch (inst.op) {
    case "add":
    case "and":
    case "eq":
    case "gt":
    case "lt":
    case "neg":
    case "not":
    case "or":
    case "sub":
    case "return":
      return (
        <tr key={key} className={highlighted ? "highlight" : ""}>
          <td>{inst.op}</td>
          <td colSpan={2}></td>
        </tr>
      );

    case "if-goto":
    case "label":
    case "goto":
      return (
        <tr key={key} className={highlighted ? "highlight" : ""}>
          <td>{inst.op}</td>
          <td colSpan={2}>{inst.label}</td>
        </tr>
      );
    case "function":
    case "call":
      return (
        <tr key={key} className={highlighted ? "highlight" : ""}>
          <td>{inst.op}</td>
          <td>{inst.name}</td>
          <td>{inst.op === "call" ? inst.nArgs : inst.nVars}</td>
        </tr>
      );
    case "pop":
    case "push":
      return (
        <tr key={key} className={highlighted ? "highlight" : ""}>
          <td>{inst.op}</td>
          <td>{inst.segment}</td>
          <td>{inst.offset}</td>
        </tr>
      );
    default:
      return (
        <tr key={key} className={highlighted ? "highlight" : ""}>
          <td colSpan={3}>Unknown</td>
        </tr>
      );
  }
}
