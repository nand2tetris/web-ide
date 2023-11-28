import { Trans } from "@lingui/macro";
import { Runbar } from "@nand2tetris/components/runbar";
import { useAsmPageStore } from "@nand2tetris/components/stores/asm.store";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { Table } from "@nand2tetris/components/table";
import { ASM } from "@nand2tetris/simulator/languages/asm.js";
import { Timer } from "@nand2tetris/simulator/timer";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { Editor } from "../shell/editor";
import { Panel } from "../shell/panel";

import "./asm.scss";

export const Asm = () => {
  const { state, actions, dispatch } = useAsmPageStore();

  const [asm, setAsm] = useState("");
  const [cmp, setCmp] = useState("");
  const sourceCursorPos = useRef(0);
  const resultCursorPos = useRef(0);

  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnerAssigned] = useState(false);

  useEffect(() => {
    runner.current = new (class AsmRunner extends Timer {
      override tick(): boolean {
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
    const file = event.target.files[0];
    const source = await file.text();
    if (fileType === "asm") {
      if (!file.name.endsWith(".asm")) {
        setStatus("File must be .asm file");
        return;
      }
      actions.loadAsm(source);
      setAsm(file.name);
    } else {
      if (!file.name.endsWith(".hack")) {
        setStatus("File must be .hack file");
        return;
      }
      dispatch.current({ action: "setCmp", payload: { cmp: source } });
      setCmp(file.name);
    }
  };

  const download = () => {
    const blob = new Blob([state.result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    if (!fileDownloadRef.current) {
      return;
    }
    fileDownloadRef.current.href = url;
    fileDownloadRef.current.download = asm.replace(".asm", ".hack");
    fileDownloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const compare = () => {
    dispatch.current({ action: "compare" });
  };

  return (
    <div className="AsmPage grid">
      <Panel
        className="source"
        header={
          <>
            <div>
              <Trans>Source</Trans>
              {asm && `: ${asm}`}
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
                  overrideTooltips={["Translate", "Translate all"]}
                />
              )}
            </div>
          </>
        }
      >
        <Editor
          value={state.asm}
          onChange={(source: string) => {
            return;
          }}
          onCursorPositionChange={(index) => {
            if (index == sourceCursorPos.current) {
              return;
            }
            sourceCursorPos.current = index;
            actions.updateHighlight(index, true);
          }}
          grammar={ASM.parser}
          language={"asm"}
          highlight={state.sourceHighlight}
          disabled={true}
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
              <fieldset role="group">
                <a ref={fileDownloadRef} style={{ display: "none" }} />
                <button onClick={download}>Download</button>
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
        />
        {state.symbols.length > 0 && "Symbol Table"}
        <Table values={state.symbols} />
      </Panel>
      <Panel
        className="compare"
        header={
          <>
            <div>
              <Trans>Compare</Trans>
              {cmp && `: ${cmp}`}
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
          language={""}
        />
      </Panel>
    </div>
  );
};

export default Asm;
