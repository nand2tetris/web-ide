import { isErr, unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { Trans } from "@lingui/macro";
import { DiffDisplay, generateDiffs } from "@nand2tetris/components/compare.js";
import { loadTestFiles } from "@nand2tetris/components/file_utils";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Runbar } from "@nand2tetris/components/runbar.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { Span } from "@nand2tetris/simulator/languages/base";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import {
  CSSProperties,
  Dispatch,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppContext } from "../App.context";
import { useDialog } from "./dialog";
import { Editor } from "./editor";
import { Panel } from "./panel";

const WARNING_KEY = "skipTestEditWarning";

export const TestPanel = ({
  runner: baseRunner,
  tst: [tst, setTst, tstHighlight],
  cmp: [cmp, setCmp],
  out: [out],
  tstName,
  setPath,
  disabled = false,
  defaultTst,
  defaultCmp,
  showName = false,
  showLoad = true,
  showClear = false,
  onSpeedChange,
  compileTest,
  prefix,
}: {
  runner: RefObject<Timer | undefined>;
  tst: [string, Dispatch<string>, Span | undefined];
  cmp: [string, Dispatch<string>];
  out: [string, Dispatch<string>];
  tstName?: string;
  setPath?: Dispatch<string>;
  defaultTst?: string;
  defaultCmp?: string;
  showName?: boolean;
  showLoad?: boolean;
  showClear?: boolean;
  disabled?: boolean;
  onSpeedChange?: (speed: number) => void;
  compileTest?: (tst: string, cmp: string) => void;
  prefix?: ReactNode;
}) => {
  const { fs, setStatus } = useContext(BaseContext);
  const { filePicker, tracking } = useContext(AppContext);

  const [showHighlight, setShowHighlight] = useState(true);
  const runner = useRef<Timer>();
  useEffect(() => {
    runner.current = new (class ChipTimer extends Timer {
      async reset(): Promise<void> {
        await baseRunner.current?.reset();
        setShowHighlight(true);
      }

      override finishFrame(): void {
        super.finishFrame();
        baseRunner.current?.finishFrame();
      }

      async tick(): Promise<boolean> {
        setShowHighlight(true);
        return (await baseRunner.current?.tick()) ?? false;
      }

      toggle(): void {
        baseRunner.current?.toggle();
      }
    })();

    return () => {
      runner.current?.stop();
    };
  }, [baseRunner]);

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

  const [editMode, setEditMode] = useState(false);
  const [skipWarning, setSkipWarning] = useState(false);
  const [savedTst, setSavedTst] = useState("");
  const [savedCmp, setSavedCmp] = useState("");
  const editDialog = useDialog();

  const onChange = (test: string) => {
    setTst(test);
    setShowHighlight(false);
  };

  const clear = () => {
    setTst(defaultTst ?? "");
    setCmp(defaultCmp ?? "");
  };

  const onEdit = () => {
    if (!localStorage.getItem(WARNING_KEY)) {
      editDialog.open();
    }
    setEditMode(true);
    setSavedTst(tst);
    setSavedCmp(cmp);
  };

  const restore = () => {
    setEditMode(false);
    setTst(savedTst);
    setCmp(savedCmp);
  };

  const [name, setName] = useStateInitializer(tstName ?? "");

  const loadTest = useCallback(async () => {
    const path = await filePicker.select(".tst");
    const files = await loadTestFiles(fs, path);
    if (isErr(files)) {
      setStatus(`Failed to load test`);
      return;
    }
    setPath?.(path);
    setName(path.split("/").pop() ?? "");
    const { tst, cmp } = unwrap(files);
    setTst?.(tst);
    setCmp?.(cmp ?? "");
  }, [filePicker, setStatus, fs]);

  const [diffDisplay, setDiffDisplay] = useState<DiffDisplay>();

  useEffect(() => {
    setDiffDisplay(generateDiffs(cmp, out));
  }, [out, cmp]);

  const editWarning = (
    <dialog open={editDialog.isOpen}>
      <article>
        <header>Warning</header>
        <main>
          <p>
            The test script can be edited during this IDE session. In the next
            session, the original script will be restored.
            <br />
          </p>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              type="checkbox"
              checked={skipWarning}
              onChange={(e) => {
                setSkipWarning(e.target.checked);
              }}
            />
            <p>Do not show this again</p>
          </div>
          <p>
            <br />
          </p>
          <button
            onClick={() => {
              if (skipWarning) {
                localStorage.setItem(WARNING_KEY, "true");
              }
              editDialog.close();
            }}
          >
            Ok
          </button>
        </main>
      </article>
    </dialog>
  );

  return (
    <Panel
      className="_test_panel"
      header={
        <>
          <div>
            <Trans>Test</Trans>
            {showName && (name == "" ? ": Default" : `: ${name}`)}
          </div>
          {editWarning}
          <div className="flex-1">
            {runner.current && (
              <Runbar
                prefix={
                  <>
                    {prefix}
                    {showClear && (
                      <button className="flex-0" onClick={clear}>
                        Clear
                      </button>
                    )}
                    {editMode ? (
                      <button className="flex-0" onClick={restore}>
                        Restore
                      </button>
                    ) : (
                      <button className="flex-0" onClick={onEdit}>
                        Edit
                      </button>
                    )}
                    {showLoad && (
                      <button
                        className="flex-0"
                        onClick={loadTest}
                        data-tooltip="Load a test script"
                        data-placement="bottom"
                      >
                        📂
                      </button>
                    )}
                  </>
                }
                runner={runner.current}
                disabled={disabled}
                onSpeedChange={onSpeedChange}
              />
            )}
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
            onChange={onChange}
            grammar={TST.parser}
            language={"tst"}
            disabled={!editMode}
            highlight={showHighlight ? tstHighlight : undefined}
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
            lineNumberTransform={(_) => ""}
            disabled={!editMode}
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
