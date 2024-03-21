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
import { useDialog } from "src/shell/dialog";
import URLs from "src/urls";
import "./asm.scss";

export const Asm = () => {
  const { state, actions, dispatch } = useAsmPageStore();
  const { toolStates, filePicker } = useContext(AppContext);

  const sourceCursorPos = useRef(0);
  const resultCursorPos = useRef(0);

  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnerAssigned] = useState(false);

  const dialog = useDialog();

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

  const loadAsm = async () => {
    const path = await filePicker.select();
    actions.loadAsm(path);
    setStatus("Loaded asm file");
  };

  const loadCompare = () => {
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

    if (!file.name.endsWith(".hack")) {
      setStatus("File must be .hack file");
      return;
    }
    dispatch.current({
      action: "setCmp",
      payload: { cmp: source, name: file.name },
    });
    setStatus("Loaded cmp file");
  };

  const download = () => {
    const blob = new Blob([state.result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    if (!fileDownloadRef.current) {
      return;
    }
    fileDownloadRef.current.href = url;
    fileDownloadRef.current.download =
      state.asmName?.replace(".asm", ".hack") ?? "result.hack";
    fileDownloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const compare = () => {
    dispatch.current({ action: "compare" });
  };

  const onSpeedChange = (speed: number) => {
    actions.setAnimate(speed <= 2);
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
              <fieldset role="group">
                <button onClick={dialog.open}>📂</button>
              </fieldset>
              <dialog open={dialog.isOpen}>
                <article>
                  <header
                    style={{ display: "flex", flexDirection: "row-reverse" }}
                  >
                    <a
                      style={{ color: "rgba(0, 0, 0, 0)" }}
                      className="close"
                      href="#root"
                      onClick={(e) => {
                        e.preventDefault();
                        dialog.close();
                      }}
                    />
                  </header>
                  <main>
                    <button
                      onClick={() => {
                        download();
                        dialog.close();
                      }}
                    >
                      Download
                    </button>
                    <Link
                      ref={redirectRef}
                      style={{ display: "none" }}
                      to={URLs["cpu"].href}
                    />
                    <button
                      onClick={async () => {
                        const bytes = await loadHack(state.result);
                        toolStates.setCpuState(
                          state.asmName?.replace(".asm", ".hack"),
                          bytes
                        );
                        redirectRef.current?.click();
                      }}
                    >
                      Load in CPU Emulator
                    </button>
                  </main>
                </article>
              </dialog>
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
