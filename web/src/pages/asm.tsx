import { Trans } from "@lingui/macro";
import { Runbar } from "@nand2tetris/components/runbar";
import { useAsmPageStore } from "@nand2tetris/components/stores/asm.store";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { NumberedTable, Table } from "@nand2tetris/components/table";
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

  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnerAssigned] = useState(false);

  useEffect(() => {
    runner.current = new (class AsmRunner extends Timer {
      override tick(): boolean {
        console.log("tick");
        return false;
      }
      override finishFrame() {
        console.log("finish frame");
      }
      override reset(): void {
        console.log("reset");
      }
      override toggle(): void {
        console.log("toggle");
      }
    })();
    setRunnerAssigned(true);

    return () => {
      runner.current?.stop();
    };
  }, [actions, dispatch]);

  const fileUploadRef = useRef<HTMLInputElement>(null);
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
      dispatch.current({ action: "setAsm", payload: { asm: source } });
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

  const compare = () => {
    console.log("compare asm");
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
            <div className="flex-1">
              {runnerAssigned && runner.current && (
                <Runbar runner={runner.current} />
              )}
            </div>
            <div>
              <fieldset role="group">
                <input
                  type="file"
                  style={{ display: "none" }}
                  ref={fileUploadRef}
                  onChange={uploadFile}
                />
                <button onClick={loadAsm}>📂</button>
              </fieldset>
            </div>
          </>
        }
      >
        <Editor
          value={state.asm}
          onChange={function (source: string): void {
            throw new Error("Function not implemented.");
          }}
          grammar={ASM.parser}
          language={"asm"}
          disabled={true}
        />
      </Panel>
      <Panel
        className="result"
        header={
          <div>
            <Trans>Result</Trans>
          </div>
        }
      >
        <NumberedTable values={["1", "2", "3", "4"]} />
        Symbol Table
        <Table
          values={[
            ["a", "1"],
            ["b", "2"],
            ["c", "3"],
          ]}
        />
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
                <button onClick={loadCompare}>📂</button>
              </fieldset>
            </div>
          </>
        }
      >
        <NumberedTable values={state.compare} />
      </Panel>
    </div>
  );
};

export default Asm;
