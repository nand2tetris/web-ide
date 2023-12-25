import * as VMLang from "@nand2tetris/simulator/languages/vm.js";
import { Keyboard } from "@nand2tetris/components/chips/keyboard.js";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { useVmPageStore } from "@nand2tetris/components/stores/vm.store.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { useEffect, useRef, useState } from "react";
import { Panel } from "../shell/panel";
import { TestPanel } from "../shell/test_panel";
import "./vm.scss";

const VM = () => {
  const { state, actions, dispatch } = useVmPageStore();

  const [tst, setTst] = useState("repeat {\n\tvmstep;\n}");
  const [out, setOut] = useState("");
  const [cmp, setCmp] = useState("");

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

  return (
    <div className="Page VmPage grid">
      <Panel className="program">
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
