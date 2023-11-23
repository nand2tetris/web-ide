import { Trans } from "@lingui/macro";
import { Runbar } from "@nand2tetris/components/runbar";
import { NumberedTable, Table } from "@nand2tetris/components/table";
import { ASM } from "@nand2tetris/simulator/languages/asm.js";
import { Timer } from "@nand2tetris/simulator/timer";
import { useEffect, useRef, useState } from "react";
import { Editor } from "../shell/editor";
import { Panel } from "../shell/panel";
import "./asm.scss";

export const Asm = () => {
  const runner = useRef<Timer>();
  const [runnerAssigned, setRunnerAssigned] = useState(false);

  useEffect(
    () => {
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
    },
    [
      /*actions, dispatch */
    ]
  );

  const loadAsm = () => {
    console.log("load asm");
  };

  const loadCompare = () => {
    console.log("load asm");
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
            </div>
            <div className="flex-1">
              {runnerAssigned && runner.current && (
                <Runbar runner={runner.current} />
              )}
            </div>
            <div>
              <fieldset role="group">
                <button onClick={loadAsm}>📂</button>
              </fieldset>
            </div>
          </>
        }
      >
        <Editor
          value={""}
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
        <NumberedTable values={["1", "2", "3", "4"]} />
      </Panel>
    </div>
  );
};

export default Asm;
