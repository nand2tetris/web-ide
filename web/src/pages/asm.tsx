import { Trans } from "@lingui/macro";
import { Runbar } from "@nand2tetris/components/runbar";
import { useAsmPageStore } from "@nand2tetris/components/stores/asm.store";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { Table } from "@nand2tetris/components/table";
import { ASM } from "@nand2tetris/simulator/languages/asm.js";
import { loadHack } from "@nand2tetris/simulator/loader.js";
import { Timer } from "@nand2tetris/simulator/timer";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { Editor } from "../shell/editor";
import { Panel } from "../shell/panel";

import { Link } from "react-router-dom";
import { AppContext } from "src/App.context";
import URLs from "src/urls";
import "./asm.scss";

export const Asm = () => {
  const { state, actions, dispatch } = useAsmPageStore();
  const { toolStates } = useContext(AppContext);

  const sourceCursorPos = useRef(0);
  const resultCursorPos = useRef(0);

  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnerAssigned] = useState(false);

  useEffect(() => {
    if (toolStates.asmState) {
      actions.overrideState(toolStates.asmState);
    }
  }, []);

  useEffect(() => {
    toolStates.setAsmState(state);
  }, [state, toolStates.setAsmState]);

  useEffect(() => {
    runner.current = new (class AsmRunner extends Timer {
      override async tick(): Promise<boolean> {
        sourceCursorPos.current = 0;
        resultCursorPos.current = 0;
        return actions.step();
      }
      override reset(): void {
        actions.reset();
      }
      override toggle(): void {
        return;
      }
    })();
    setRunnerAssigned(true);

    return () => {
      runner.current?.stop();
    };
  }, [actions, dispatch]);

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const fileDownloadRef = useRef<HTMLAnchorElement>(null);
  const redirectRef = useRef<HTMLAnchorElement>(null);
  let fileType: "asm" | "cmp" = "asm";

  const loadAsm = () => {
    fileType = "asm";
    fileUploadRef.current?.click();
  };

  const loadCompare = () => {
    fileType = "cmp";
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
    if (fileType === "asm") {
      if (!file.name.endsWith(".asm")) {
        setStatus("File must be .asm file");
        return;
      }
      actions.setAsm(source, file.name);
      setStatus("Loaded asm file");
    } else {
      if (!file.name.endsWith(".hack")) {
        setStatus("File must be .hack file");
        return;
      }
      dispatch.current({
        action: "setCmp",
        payload: { cmp: source, name: file.name },
      });
      setStatus("Loaded cmp file");
    }
  };

  const downloadAsm = () => download(state.asm, state.asmName ?? "source.asm");
  const downloadHack = () =>
    download(
      state.result,
      state.asmName?.replace(".asm", ".hack") ?? "result.hack"
    );

  const download = (content: string, name: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    if (!fileDownloadRef.current) {
      return;
    }
    fileDownloadRef.current.href = url;
    fileDownloadRef.current.download = name;
    fileDownloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const compare = () => {
    dispatch.current({ action: "compare" });
  };

  const onSpeedChange = (speed: number) => {
    actions.setAnimate(speed <= 2);
  };

  const loadToCpu = async () => {
    const bytes = await loadHack(state.result);
    toolStates.setCpuState(state.asmName?.replace(".asm", ".hack"), bytes);
    redirectRef.current?.click();
  };

  return (
    <div className="AsmPage grid">
      <Panel
        className="source"
        header={
          <>
            <div>
              <Trans>Source</Trans>
              {state.asmName && `: ${state.asmName}`}
            </div>
            <input
              type="file"
              style={{ display: "none" }}
              ref={fileUploadRef}
              onChange={uploadFile}
            />
            <div className="flex-1">
              {runnerAssigned && runner.current && (
                <Runbar
                  runner={runner.current}
                  disabled={state.error != undefined}
                  prefix={
                    <button
                      className="flex-0"
                      onClick={loadAsm}
                      data-tooltip="Load file"
                      data-placement="bottom"
                    >
                      📂
                    </button>
                  }
                  overrideTooltips={{ step: "Translate", run: "Translate all" }}
                  onSpeedChange={onSpeedChange}
                />
              )}
            </div>
            <fieldset role="group">
              <button
                data-tooltip="Download file"
                data-placement="left"
                onClick={downloadAsm}
              >
                Download
              </button>
            </fieldset>
          </>
        }
      >
        <Editor
          value={state.asm}
          error={state.error}
          onChange={(source: string) => {
            actions.setAsm(source);
          }}
          onCursorPositionChange={(index) => {
            if (index == sourceCursorPos.current) {
              return;
            }
            sourceCursorPos.current = index;

            // wait some time to allow the user to release the mouse before updating the highligh
            // (otherwise we auto-scroll while the mouse is pressed and cause unwanted text selection)
            setTimeout(() => {
              actions.updateHighlight(index, true);
            }, 100);
          }}
          grammar={ASM.parser}
          language={"asm"}
          highlight={state.translating ? state.sourceHighlight : undefined}
          lineNumberTransform={(n) => {
            if (!state.translating) {
              return "";
            }
            const num = state.lineNumbers[n] as number | undefined;
            return (num === undefined ? "" : num).toString();
          }}
        />
      </Panel>
      <Panel
        className="result"
        header={
          <>
            <div>
              <Trans>Binary Code</Trans>
            </div>
            <div>
              <a ref={fileDownloadRef} style={{ display: "none" }} />
              <Link
                ref={redirectRef}
                style={{ display: "none" }}
                to={URLs["cpu"].href}
              />
              <fieldset role="group">
                <button
                  data-tooltip="Load to the CPU Emulator"
                  data-placement="bottom"
                  onClick={loadToCpu}
                >
                  ↩️
                </button>
                <button
                  data-tooltip="Download translated file"
                  data-placement="left"
                  onClick={downloadHack}
                >
                  Download
                </button>
              </fieldset>
            </div>
          </>
        }
      >
        <Editor
          value={state.result}
          highlight={state.resultHighlight}
          disabled={true}
          onChange={function (source: string): void {
            return;
          }}
          onCursorPositionChange={(index) => {
            if (index == resultCursorPos.current) {
              return;
            }
            resultCursorPos.current = index;
            actions.updateHighlight(index, false);
          }}
          grammar={undefined}
          language={""}
          dynamicHeight={true}
          lineNumberTransform={(n) => (n - 1).toString()}
        />
        {state.symbols.length > 0 && state.translating && "Symbol Table"}
        {state.translating && <Table values={state.symbols} />}
      </Panel>
      <Panel
        className="compare"
        header={
          <>
            <div>
              <Trans>Compare</Trans>
              {state.compareName && `: ${state.compareName}`}
            </div>
            <div>
              <fieldset role="group">
                <button onClick={compare}>Compare</button>
                <button
                  onClick={loadCompare}
                  data-tooltip="Load file"
                  data-placement="left"
                >
                  📂
                </button>
              </fieldset>
            </div>
          </>
        }
      >
        <Editor
          value={state.compare}
          highlight={state.translating ? state.resultHighlight : undefined}
          disabled={true}
          onChange={function (source: string): void {
            return;
          }}
          onCursorPositionChange={(index) => {
            if (index == resultCursorPos.current) {
              return;
            }
            resultCursorPos.current = index;
            actions.updateHighlight(index, false);
          }}
          language={""}
          lineNumberTransform={(n) => (n - 1).toString()}
        />
      </Panel>
    </div>
  );
};

export default Asm;
