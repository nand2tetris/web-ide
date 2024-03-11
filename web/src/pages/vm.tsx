import { Trans, t } from "@lingui/macro";
import { Keyboard } from "@nand2tetris/components/chips/keyboard.js";
import Memory from "@nand2tetris/components/chips/memory";
import { Screen } from "@nand2tetris/components/chips/screen.js";
import { useStateInitializer } from "@nand2tetris/components/react";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { useVmPageStore } from "@nand2tetris/components/stores/vm.store.js";
import * as VMLang from "@nand2tetris/simulator/languages/vm.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { ERRNO, isSysError } from "@nand2tetris/simulator/vm/os/errors.js";
import { VmFrame } from "@nand2tetris/simulator/vm/vm.js";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "src/App.context";
import { Panel } from "../shell/panel";
import { TestPanel } from "../shell/test_panel";
import "./vm.scss";

const ERROR_MESSAGES: Record<ERRNO, string> = {
  [ERRNO.SYS_WAIT_DURATION_NOT_POSITIVE]: t`Duration must be positive (Sys.wait)`,
  [ERRNO.ARRAY_SIZE_NOT_POSITIVE]: t`Array size must be positive (Array.new)`,
  [ERRNO.DIVIDE_BY_ZERO]: t`Division by zero (Math.divide)`,
  [ERRNO.SQRT_NEG]: t`Cannot compute square root of a negative number (Math.sqrt)`,
  [ERRNO.ALLOC_SIZE_NOT_POSITIVE]: t`Allocated memory size must be positive (Memory.alloc)`,
  [ERRNO.HEAP_OVERFLOW]: t`Heap overflow (Memory.alloc)`,
  [ERRNO.ILLEGAL_PIXEL_COORD]: t`Illegal pixel coordinates (Screen.drawPixel)`,
  [ERRNO.ILLEGAL_LINE_COORD]: t`Illegal line coordinates (Screen.drawLine)`,
  [ERRNO.ILLEGAL_RECT_COORD]: t`Illegal rectangle coordinates (Screen.drawRectangle)`,
  [ERRNO.ILLEGAL_CENTER_COORD]: t`Illegal center coordinates (Screen.drawCircle)`,
  [ERRNO.ILLEGAL_RADIUS]: t`Illegal radius (Screen.drawCircle)`,
  [ERRNO.STRING_LENGTH_NEG]: t`Maximum length must be non-negative (String.new)`,
  [ERRNO.GET_CHAR_INDEX_OUT_OF_BOUNDS]: t`String index out of bounds (String.charAt)`,
  [ERRNO.SET_CHAR_INDEX_OUT_OF_BOUNDS]: t`String index out of bounds (String.setCharAt)`,
  [ERRNO.STRING_FULL]: t`String is full (String.appendChar)`,
  [ERRNO.STRING_EMPTY]: t`String is empty (String.eraseLastChar)`,
  [ERRNO.STRING_INSUFFICIENT_CAPACITY]: t`Insufficient string capacity (String.setInt)`,
  [ERRNO.ILLEGAL_CURSOR_LOCATION]: t`Illegal cursor location (Output.moveCursor)`,
};

const VM = () => {
  const { state, actions, dispatch } = useVmPageStore();
  const { toolStates } = useContext(AppContext);
  const { setStatus } = useContext(BaseContext);

  const [tst, setTst] = useStateInitializer(state.files.tst);
  const [out, setOut] = useStateInitializer(state.files.out);
  const [cmp, setCmp] = useStateInitializer(state.files.cmp);

  useEffect(() => {
    toolStates.setTool("vm");
  }, []);

  useEffect(() => {
    actions.initialize();
  }, [actions]);

  useEffect(() => {
    console.log("use effect exit code", state.controls.exitCode);
    if (state.controls.exitCode !== undefined) {
      setStatus(
        state.controls.exitCode == 0
          ? "Program halted"
          : `Program exited with error code ${state.controls.exitCode}${
              isSysError(state.controls.exitCode)
                ? `: ${ERROR_MESSAGES[state.controls.exitCode]}`
                : ""
            }`
      );
    }
  }, [state.controls.exitCode]);

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
      <Panel className="stack" header={<Trans>VM</Trans>}>
        {state.vm.Stack.map((frame, i) => (
          <VMStackFrame frame={frame} key={i} />
        ))}
      </Panel>
      <Panel className="display" style={{ gridArea: "display" }}>
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
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Memory memory={state.vm.RAM} format="hex" />
            <Memory memory={state.vm.RAM} format="hex" />
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
