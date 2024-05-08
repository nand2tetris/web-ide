import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";

import { Trans, t } from "@lingui/macro";
import { Keyboard } from "@nand2tetris/components/chips/keyboard.js";
import Memory from "@nand2tetris/components/chips/memory";
import { Screen, ScreenScales } from "@nand2tetris/components/chips/screen.js";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Runbar } from "@nand2tetris/components/runbar";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import {
  DEFAULT_TEST,
  useVmPageStore,
} from "@nand2tetris/components/stores/vm.store.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import { ERRNO, isSysError } from "@nand2tetris/simulator/vm/os/errors.js";
import { IMPLICIT, SYS_INIT, VmFrame } from "@nand2tetris/simulator/vm/vm.js";

import { VmFile } from "@nand2tetris/simulator/test/vmtst";
import { AppContext } from "../App.context";
import { Editor } from "../shell/editor";
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

interface Rerenderable {
  rerender: () => void;
}

const VM = () => {
  const { state, actions, dispatch } = useVmPageStore();
  const { setStatus } = useContext(BaseContext);
  const { toolStates, setTitle } = useContext(AppContext);

  const [tst, setTst] = useStateInitializer(state.files.tst);
  const [out, setOut] = useStateInitializer(state.files.out);
  const [cmp, setCmp] = useStateInitializer(state.files.cmp);
  const [path, setPath] = useState("/");

  useEffect(() => {
    actions.initialize();
  }, [actions]);

  useEffect(() => {
    setTitle(toolStates.vm.title);
  });

  useEffect(() => {
    if (toolStates.vm.files) {
      actions.loadVm(toolStates.vm.files);
    }
  }, [toolStates.vm.files]);

  useEffect(() => {
    actions.loadTest(path, tst, cmp);
    actions.reset();
  }, [tst, cmp]);

  useEffect(() => {
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

  const vmRunner = useRef<Timer>();
  const testRunner = useRef<Timer>();
  const [runnersAssigned, setRunnersAssigned] = useState(false);
  useEffect(() => {
    vmRunner.current = new (class VMTimer extends Timer {
      override async tick() {
        return actions.step();
      }

      override finishFrame() {
        dispatch.current({ action: "update" });
      }

      override reset() {
        setStatus("Reset");
        actions.reset();
      }

      override toggle() {
        dispatch.current({ action: "update" });
      }
    })();

    testRunner.current = new (class TestTimer extends Timer {
      override async tick() {
        return actions.testStep();
      }

      override finishFrame() {
        dispatch.current({ action: "update" });
      }

      override reset() {
        setStatus("Reset");
        actions.reset();
      }

      override toggle() {
        dispatch.current({ action: "update" });
      }
    })();

    setRunnersAssigned(true);

    return () => {
      vmRunner.current?.stop();
      testRunner.current?.stop();
    };
  }, [actions, dispatch]);

  const uploadRef = useRef<HTMLInputElement>(null);

  const load = () => {
    uploadRef.current?.click();
  };

  const onLoad = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length == 0) {
      return;
    }

    const sources: VmFile[] = [];
    for (const file of event.target.files) {
      if (file.name.endsWith(".vm")) {
        sources.push({
          name: file.name.replace(".vm", ""),
          content: await file.text(),
        });
      }
    }

    const dirName = event.target.files[0].webkitRelativePath.split("/")[0];
    toolStates.vm.setTitle(`Folder name: ${dirName}`);

    actions.loadVm(sources);
    actions.reset();
    setStatus("");
  };

  const onSpeedChange = (speed: number) => {
    actions.setAnimate(speed <= 2);
  };

  const stackRef = useRef<Rerenderable>();

  const [scale, setScale] = useState<ScreenScales>(1);
  const onScale = (scale: ScreenScales) => {
    setScale(scale);
  };

  return (
    <div
      className={`Page VmPage grid ${
        scale == 0 ? "no-screen" : scale == 2 ? "large-screen" : "normal"
      }`}
    >
      <Panel
        className="program"
        header={
          <>
            <input
              style={{ display: "none" }}
              ref={uploadRef}
              type="file"
              webkitdirectory=""
              onChange={onLoad}
            />
            <div className="flex-0" style={{ whiteSpace: "nowrap" }}>
              <Trans>VM Code</Trans>
            </div>
            <div className="flex-1">
              {runnersAssigned && vmRunner.current && (
                <Runbar
                  prefix={
                    <button
                      className="flex-0"
                      onClick={load}
                      data-tooltip="Load files"
                      data-placement="bottom"
                    >
                      📂
                    </button>
                  }
                  runner={vmRunner.current}
                  disabled={!state.controls.valid}
                  onSpeedChange={onSpeedChange}
                />
              )}
            </div>
          </>
        }
      >
        <Editor
          value={state.files.vm}
          onChange={(source: string) => {
            actions.setVm(source);
          }}
          language={"vm"}
          highlight={
            state.controls.valid && state.vm.showHighlight
              ? state.vm.highlight
              : undefined
          }
          error={state.controls.error}
        />
      </Panel>
      <Panel className="vm" header={<Trans>VM Structures</Trans>}>
        {state.controls.valid && state.vm.Stack.length > 0 && (
          <>
            <VMStackFrame
              statics={state.vm.Statics}
              temp={state.vm.Temp}
              frame={state.vm.Stack[0]}
            />
            <CallStack
              stack={state.vm.Stack}
              addedSysInit={state.vm.AddedSysInit}
            />
          </>
        )}
      </Panel>
      <Panel className="display" style={{ gridArea: "display" }}>
        <Screen
          memory={state.vm.Screen}
          showScaleControls={true}
          scale={scale}
          onScale={onScale}
        />
        <Keyboard keyboard={state.vm.Keyboard} />
      </Panel>
      <Memory
        ref={stackRef}
        name="RAM"
        memory={state.vm.RAM}
        initialAddr={256}
        format="dec"
        showClear={false}
      />
      <Memory
        name="RAM"
        className="Stack"
        memory={state.vm.RAM}
        format="dec"
        cellLabels={[
          "SP:",
          "LCL:",
          "ARG:",
          "THIS:",
          "THAT:",
          "TEMP0:",
          "TEMP1:",
          "TEMP2:",
          "TEMP3:",
          "TEMP4:",
          "TEMP5:",
          "TEMP6:",
          "TEMP7:",
          "R13:",
          "R14:",
          "R15:",
        ]}
        onChange={() => {
          stackRef.current?.rerender();
        }}
      />

      {runnersAssigned && (
        <TestPanel
          runner={testRunner}
          tst={[tst, setTst, state.test.highlight]}
          out={[out, setOut]}
          cmp={[cmp, setCmp]}
          setPath={setPath}
          showClear={true}
          defaultTst={DEFAULT_TEST}
          onSpeedChange={onSpeedChange}
          disabled={!state.controls.valid}
        />
      )}
    </div>
  );
};

export default VM;

const UNKNOWN = "Unknown function";

function callStack(frames: VmFrame[], addedSysInit: boolean) {
  const nameCounts: Record<string, number> = {};
  frames = frames.filter((frame) => frame.fn?.name != IMPLICIT);

  for (const frame of frames) {
    if (!frame.fn) {
      continue;
    }

    if (nameCounts[frame.fn.name]) {
      nameCounts[frame.fn.name]++;
    } else {
      nameCounts[frame.fn.name] = 1;
    }
  }

  const names = frames
    .slice()
    .reverse()
    .map((frame) =>
      frame.fn?.name == SYS_INIT.name
        ? addedSysInit
          ? `${SYS_INIT.name} (built-in)`
          : SYS_INIT.name
        : frame.fn?.name ?? UNKNOWN
    );

  for (const name of Object.keys(nameCounts)) {
    if (nameCounts[name] == 1) {
      continue;
    }

    nameCounts[name] = 0;
    for (let i = 0; i < names.length; i++) {
      if (names[i] === name) {
        names[i] = `${name}[${nameCounts[name]}]`;
        nameCounts[name]++;
      }
    }
  }

  return names;
}

function CallStack({
  stack,
  addedSysInit,
}: {
  stack: VmFrame[];
  addedSysInit: boolean;
}) {
  return (
    <section>
      <p>
        Call-stack:
        <code>{callStack(stack, addedSysInit).join(" > ")}</code>
      </p>
    </section>
  );
}

function VMStackFrame({
  statics,
  temp,
  frame,
}: {
  statics: number[];
  temp: number[];
  frame: VmFrame;
}) {
  return (
    <section>
      <main>
        <p>
          Stack:
          <code>[{frame.stack.values.join(", ")}]</code>
        </p>
        {frame.usedSegments?.has("local") && (
          <p>
            local:
            <code>[{frame.locals.values.join(", ")}]</code>
          </p>
        )}
        {frame.usedSegments?.has("argument") && (
          <p>
            argument:
            <code>[{frame.args.values.join(", ")}]</code>
          </p>
        )}
        {frame.usedSegments?.has("static") && (
          <p>
            static:
            <code>[{statics.join(", ")}]</code>
          </p>
        )}
        {frame.usedSegments?.has("pointer") && (
          <p>
            pointer:
            <code>[{`${frame.frame.THIS}, ${frame.frame.THAT}`}]</code>
          </p>
        )}
        {frame.usedSegments?.has("this") && (
          <p>
            this:
            <code>[{frame.this.values.join(", ")}]</code>
          </p>
        )}
        {frame.usedSegments?.has("that") && (
          <p>
            that:
            <code>[{frame.that.values.join(", ")}]</code>
          </p>
        )}
        {frame.usedSegments?.has("temp") && (
          <p>
            temp:
            <code>[{temp.join(", ")}]</code>
          </p>
        )}
      </main>
    </section>
  );
}
