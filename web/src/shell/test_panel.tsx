import { Trans } from "@lingui/macro";
import { DiffDisplay, generateDiffs } from "@nand2tetris/components/compare.js";
import { Runbar } from "@nand2tetris/components/runbar.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { Span } from "@nand2tetris/simulator/languages/base";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import {
  CSSProperties,
  Dispatch,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppContext } from "../App.context";
import { Editor } from "./editor";
import { Panel } from "./panel";

export const TestPanel = ({
  runner,
  tst: [tst, setTst, tstHighlight],
  cmp: [cmp, setCmp],
  out: [out],
  disabled = false,
  onLoadTest = undefined,
  onSpeedChange = undefined,
}: {
  runner: RefObject<Timer | undefined>;
  tst: [string, Dispatch<string>, Span | undefined];
  cmp: [string, Dispatch<string>];
  out: [string, Dispatch<string>];
  disabled?: boolean;
  onLoadTest?: (tst: string, cmp?: string) => void;
  onSpeedChange?: (speed: number) => void;
}) => {
  const { fs, setStatus } = useContext(BaseContext);
  const { filePicker, tracking } = useContext(AppContext);

  const [selectedTestTab, doSetSelectedTestTab] = useState<
    "tst" | "cmp" | "out"
  >("tst");

  const setSelectedTestTab = useCallback(
    (tab: typeof selectedTestTab) => {
      doSetSelectedTestTab(tab);
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking]
  );

  const loadTest = useCallback(async () => {
    try {
      const path = await filePicker.select();
      const tst = await fs.readFile(path);
      let cmp: string | undefined = undefined;
      try {
        const cmpName = path.replace("VME.tst", ".tst").replace(".tst", ".cmp");
        cmp = await fs.readFile(cmpName);
      } catch (e) {
        // There doesn't have to be a compare file
      }
      onLoadTest?.(tst, cmp);
      // await compile.current({ tst });
    } catch (e) {
      console.error(e);
      setStatus(`Failed to load test`);
    }
  }, [filePicker, setStatus, fs]);

  const [diffDisplay, setDiffDisplay] = useState<DiffDisplay>();

  useEffect(() => {
    setDiffDisplay(generateDiffs(cmp, out));
  }, [out, cmp]);

  return (
    <Panel
      className="_test_panel"
      header={
        <>
          <div className="flex-0">
            <Trans>Test</Trans>
          </div>
          <div className="flex-1">
            {runner.current && (
              <Runbar runner={runner.current} onSpeedChange={onSpeedChange} />
            )}
          </div>
          <div>
            <fieldset role="group">
              <button onClick={loadTest}>📂</button>
            </fieldset>
          </div>
        </>
      }
    >
      <div role="tablist" style={{ "--tab-count": "3" } as CSSProperties}>
        <div
          role="tab"
          id="test-tab-tst"
          aria-controls="test-tabpanel-tst"
          aria-selected={selectedTestTab === "tst"}
        >
          <label>
            <input
              type="radio"
              name="test-tabs"
              aria-controls="test-tabpanel-tst"
              value="tst"
              checked={selectedTestTab === "tst"}
              onChange={() => setSelectedTestTab("tst")}
            />
            Test Script
          </label>
        </div>
        <div
          role="tabpanel"
          aria-labelledby="test-tab-tst"
          id="test-tabpanel-tst"
        >
          <Editor
            value={tst}
            onChange={setTst}
            grammar={TST.parser}
            language={"tst"}
            highlight={tstHighlight}
            disabled={disabled}
          />
        </div>
        <div
          role="tab"
          id="test-tab-cmp"
          aria-controls="test-tablpanel-cmp"
          aria-selected={selectedTestTab === "cmp"}
        >
          <label>
            <input
              type="radio"
              name="test-tabs"
              aria-controls="test-tabpanel-cmp"
              value="cmp"
              checked={selectedTestTab === "cmp"}
              onChange={() => setSelectedTestTab("cmp")}
            />
            Compare File
          </label>
        </div>
        <div
          role="tabpanel"
          aria-labelledby="test-tab-cmp"
          id="test-tabpanel-cmp"
          style={{ position: "relative" }}
        >
          <Editor
            value={cmp}
            onChange={setCmp}
            grammar={CMP.parser}
            language={"cmp"}
            disabled={disabled}
            lineNumberTransform={(_) => ""}
          />
        </div>
        <div
          role="tab"
          id="test-tab-out"
          aria-controls="test-tabpanel-out"
          aria-selected={selectedTestTab === "out"}
        >
          <label>
            <input
              type="radio"
              name="test-tabs"
              aria-controls="test-tabpanel-out"
              value="out"
              checked={selectedTestTab === "out"}
              onChange={() => setSelectedTestTab("out")}
            />
            Output File
          </label>
        </div>
        <div
          role="tabpanel"
          id="test-tabpanel-out"
          aria-labelledby="test-tab-out"
        >
          {out == "" && <p>Execute test script to compare output.</p>}
          {(diffDisplay?.failureNum ?? 0) > 0 && (
            <p>
              {diffDisplay?.failureNum} comparison failure
              {diffDisplay?.failureNum === 1 ? "" : "s"}. Scroll down for
              details
            </p>
          )}
          <Editor
            value={diffDisplay?.text ?? ""}
            onChange={() => {
              return;
            }}
            language={""}
            disabled={true}
            lineNumberTransform={(_) => ""}
            customDecorations={diffDisplay?.correctCellSpans
              .map((span) => {
                return { span, cssClass: "green" };
              })
              .concat(
                diffDisplay?.incorrectCellSpans.map((span) => {
                  return { span, cssClass: "red" };
                })
              )}
          />
        </div>
      </div>
    </Panel>
  );
};
