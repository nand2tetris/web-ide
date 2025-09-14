import { Trans } from "@lingui/macro";
import { Runbar } from "@nand2tetris/components/runbar";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { Table } from "@nand2tetris/components/table";
import { ASM } from "@nand2tetris/simulator/languages/asm.js";
import { loadHack } from "@nand2tetris/simulator/loader.js";
import { Timer } from "@nand2tetris/simulator/timer";
import { useContext, useEffect, useRef, useState } from "react";
import { Editor } from "../shell/editor";
import { Panel } from "../shell/panel";

import { LOADING } from "@nand2tetris/components/messages.js";
import { ROM } from "@nand2tetris/simulator/cpu/memory";
import { Link } from "react-router-dom";
import { isPath } from "src/shell/file_select";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import URLs from "../urls";
import "./asm.scss";

export const Asm = () => {
  const { filePicker } = useContext(AppContext);
  const { stores, setTool } = useContext(PageContext);
  const { state, actions, dispatch } = stores.asm;
  const { fs, localFsRoot } = useContext(BaseContext);

  const sourceCursorPos = useRef(0);
  const resultCursorPos = useRef(0);

  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnerAssigned] = useState(false);

  const [showSymbolTable, setShowSymbolTable] = useState(true);

  useEffect(() => {
    setTool("asm");
  }, [setTool]);

  useEffect(() => {
    runner.current = new (class AsmRunner extends Timer {
      override async tick(): Promise<boolean> {
        sourceCursorPos.current = 0;
        resultCursorPos.current = 0;
        return await actions.step();
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

  const fileDownloadRef = useRef<HTMLAnchorElement>(null);
  const redirectRef = useRef<HTMLAnchorElement>(null);

  const loadAsm = async () => {
    const path = await filePicker.select({ suffix: ".asm" });
    setStatus(LOADING);
    requestAnimationFrame(async () => {
      await actions.loadAsm(path.path);
      setStatus("");
      dispatch.current({
        action: "setTitle",
        payload: path.path.split("/").pop() ?? "",
      });
    });
  };

  const loadCompare = async () => {
    const filesRef = await filePicker.selectAllowLocal({ suffix: "hack" });
    if (isPath(filesRef)) {
      const cmp = await fs.readFile(filesRef.path);
      dispatch.current({
        action: "setCmp",
        payload: { cmp, name: filesRef.path.split("/").pop() },
      });
    } else {
      const file = Array.isArray(filesRef) ? filesRef[0] : filesRef;
      dispatch.current({
        action: "setCmp",
        payload: { cmp: file.content, name: file.name },
      });
    }
  };

  const { setStatus } = useContext(BaseContext);

  const downloadAsm = () =>
    download(state.asm, state.path?.split("/").pop() ?? "source.asm");
  const downloadHack = () =>
    download(
      state.result,
      state.path?.split("/").pop()?.replace(".asm", ".hack") ?? "result.hack",
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
    actions.compare();
  };

  const onSpeedChange = (speed: number) => {
    dispatch.current({ action: "updateConfig", payload: { speed } });
    actions.setAnimate(speed <= 2);
  };

  const loadToCpu = async () => {
    const bytes = await loadHack(state.result);
    const rom = new ROM();
    await rom.loadBytes(bytes);
    stores.cpu.actions.replaceROM(rom);
    if (state.path) {
      stores.cpu.dispatch.current({
        action: "setTitle",
        payload: state.path.split("/").pop() ?? "",
      });
      stores.cpu.actions.setPath(state.path);
      stores.cpu.actions.reset();
    }
    redirectRef.current?.click();
  };

  return (
    <div className={`AsmPage grid ${showSymbolTable ? "" : "hide-sym"}`}>
      <Panel
        className="source"
        isEditorPanel={true}
        header={
          <>
            <div>
              <Trans>Source</Trans>
            </div>
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
                  speed={state.config.speed}
                  onSpeedChange={onSpeedChange}
                />
              )}
            </div>
            {!localFsRoot && (
              <fieldset role="group">
                <button
                  data-tooltip="Download"
                  data-placement="left"
                  onClick={downloadAsm}
                >
                  ⬇️
                </button>
              </fieldset>
            )}
          </>
        }
      >
        <Editor
          value={state.asm}
          error={state.error}
          alwaysRecenter={false}
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
        isEditorPanel={true}
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
                  data-tooltip="Load in CPU Emulator"
                  data-placement="left"
                  onClick={loadToCpu}
                >
                  ↩️
                </button>
                {!localFsRoot && (
                  <button
                    data-tooltip="Download"
                    data-placement="left"
                    onClick={downloadHack}
                  >
                    ⬇️
                  </button>
                )}
              </fieldset>
            </div>
          </>
        }
      >
        <Editor
          value={state.result}
          highlight={state.resultHighlight}
          disabled={true}
          onChange={function (_source: string): void {
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
          alwaysRecenter={false}
          lineNumberTransform={(n) => (n - 1).toString()}
        />
      </Panel>
      <Panel
        className="sym"
        isEditorPanel={true}
        header={
          <>
            <div className="flex-1">
              <Trans>Symbol Table</Trans>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked={showSymbolTable}
              onChange={() => setShowSymbolTable(!showSymbolTable)}
            />
          </>
        }
      >
        {state.translating && showSymbolTable && (
          <Table values={state.symbols} />
        )}
      </Panel>
      <Panel
        className="compare"
        header={
          <>
            <div>
              <Trans>Compare Code</Trans>
              {state.compareName && `: ${state.compareName}`}
            </div>
            <fieldset role="group">
              <button onClick={loadCompare}>📂</button>
            </fieldset>
            <div className="flex-1" />
            <fieldset role="group">
              <button onClick={compare}>Compare</button>
            </fieldset>
          </>
        }
      >
        <Editor
          value={state.compare}
          highlight={state.translating ? state.resultHighlight : undefined}
          highlightType={state.compareError ? "error" : "highlight"}
          alwaysRecenter={false}
          onChange={function (_source: string): void {
            return;
          }}
          disabled={true}
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
