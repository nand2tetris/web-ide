import { Trans } from "@lingui/macro";
import { Keyboard } from "@nand2tetris/components/chips/keyboard.js";
import Memory from "@nand2tetris/components/chips/memory";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { useStateInitializer } from "@nand2tetris/components/react";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { useVmPageStore } from "@nand2tetris/components/stores/vm.store.js";
import * as VMLang from "@nand2tetris/simulator/languages/vm.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { VmFrame } from "@nand2tetris/simulator/vm/vm.js";
import {
  CSSProperties,
  ChangeEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "src/App.context";
import { Panel } from "../shell/panel";
import { TestPanel } from "../shell/test_panel";
import "./vm.scss";

const VM = () => {
  const { state, actions, dispatch } = useVmPageStore();
  const { toolStates } = useContext(AppContext);

  const [tst, setTst] = useStateInitializer(state.files.tst);
  const [out, setOut] = useStateInitializer(state.files.out);
  const [cmp, setCmp] = useStateInitializer(state.files.cmp);

  useEffect(() => {
    toolStates.setTool("vm");
  }, []);

  useEffect(() => {
    actions.initialize();
  }, [actions]);
  const [selectedRAMTab, setSelectedRAMTab] = useState<"Stack" | "RAM">(
    "Stack"
  );

  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnersAssigned] = useState(false);
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      override async tick() {
        return actions.step();
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

    const sources = [];
    for (const file of event.target.files) {
      if (file.name.endsWith(".vm")) {
        sources.push({
          name: file.name.replace(".vm", ""),
          content: await file.text(),
        });
      }
    }

    if (sources.length == 0) {
      setStatus("No .vm file was selected");
      return;
    }
    const success = actions.loadVm(sources);
    if (success) {
      setStatus("Loaded vm file");
    }
  };

  const onSpeedChange = (speed: number) => {
    actions.setAnimate(speed <= 2);
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
              multiple
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
        {state.controls.animate ? (
          <div role="tablist" style={{ "--tab-count": "2" } as CSSProperties}>
            <div
              role="tab"
              id="mem-tab-stack"
              aria-controls="mem-tabpanel"
              aria-selected={selectedRAMTab === "Stack"}
            >
              <label>
                <input
                  type="radio"
                  name="mem-tabs"
                  aria-controls="mem-tabpanel"
                  value="tst"
                  checked={selectedRAMTab === "Stack"}
                  onChange={() => setSelectedRAMTab("Stack")}
                />
                Stack
              </label>
            </div>
            <div
              role="tabpanel"
              aria-labelledby="mem-tab-stack"
              id="mem-tabpanel"
            >
              {state.vm.Stack.map((frame, i) => (
                <VMStackFrame frame={frame} key={i} />
              ))}
            </div>
            <div
              role="tab"
              id="mem-tab-ram"
              aria-controls="mem-tabpanel"
              aria-selected={selectedRAMTab === "RAM"}
            >
              <label>
                <input
                  type="radio"
                  name="mem-tabs"
                  aria-controls="mem-tabpanel"
                  value="tst"
                  checked={selectedRAMTab === "RAM"}
                  onChange={() => setSelectedRAMTab("RAM")}
                />
                RAM
              </label>
            </div>
            <div
              role="tabpanel"
              aria-labelledby="mem-tab-ram"
              id="mem-tabpanel"
            >
              <Memory memory={state.vm.RAM} format="hex" />
            </div>
          </div>
        ) : (
          <p>Hiding display for high speeds</p>
        )}
      </Panel>
      {runnerAssigned && (
        <TestPanel
          runner={runner}
          tst={[tst, setTst, state.test.highlight]}
          out={[out, setOut]}
          cmp={[cmp, setCmp]}
          onLoadTest={actions.loadTest}
          onSpeedChange={onSpeedChange}
        />
      )}
    </div>
  );
};

export default VM;

export function VMStackFrame({ frame }: { frame: VmFrame }) {
  return (
    <section>
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
  );
}

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
          <td>{inst.offset.toString()}</td>
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
