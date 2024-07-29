import { isErr, unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { Trans } from "@lingui/macro";
import {
  DecorationType,
  DiffDisplay,
  generateDiffs,
} from "@nand2tetris/components/compare.js";
import { loadTestFiles } from "@nand2tetris/components/file_utils";
import { useStateInitializer } from "@nand2tetris/components/react";
import { RunSpeed, Runbar } from "@nand2tetris/components/runbar.js";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { Span } from "@nand2tetris/simulator/languages/base";
import { CMP } from "@nand2tetris/simulator/languages/cmp.js";
import { TST } from "@nand2tetris/simulator/languages/tst.js";
import { Timer } from "@nand2tetris/simulator/timer.js";
import {
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
import { Tab, TabList } from "./tabs";

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
  speed,
  onSpeedChange,
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
  speed?: RunSpeed;
  onSpeedChange?: (speed: number) => void;
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

  const setSelectedTestTab = useCallback(
    (tab: "tst" | "cmp" | "out" | "diff") => {
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking],
  );

  const [editMode, _] = useState(false);
  const [skipWarning, setSkipWarning] = useState(false);
  const editDialog = useDialog();

  const onChange = (test: string) => {
    setTst(test);
    setShowHighlight(false);
  };

  const clear = () => {
    setTst(defaultTst ?? "");
    setCmp(defaultCmp ?? "");
  };

  const [name, setName] = useStateInitializer(tstName ?? "");

  const loadTest = useCallback(async () => {
    const path = await filePicker.select({ suffix: ".tst" });
    const files = await loadTestFiles(fs, path);
    if (isErr(files)) {
      setStatus(`Failed to load test`);
      return;
    }
    setPath?.(path);
    setName(path.split("/").pop() ?? "");
    const { tst } = unwrap(files);
    setTst?.(tst);
    setCmp?.("");
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
                speed={speed}
                onSpeedChange={onSpeedChange}
              />
            )}
          </div>
        </>
      }
    >
      <TabList>
        <Tab title="Test Script" onSelect={() => setSelectedTestTab("tst")}>
          <Editor
            value={tst}
            onChange={onChange}
            grammar={TST.parser}
            language={"tst"}
            disabled={!editMode}
            highlight={showHighlight ? tstHighlight : undefined}
          />
        </Tab>
        <Tab title="Compare File" onSelect={() => setSelectedTestTab("cmp")}>
          <Editor
            value={cmp}
            onChange={setCmp}
            grammar={CMP.parser}
            language={"cmp"}
            lineNumberTransform={(_) => ""}
            disabled={!editMode}
          />
        </Tab>
        <Tab title="Output File" onSelect={() => setSelectedTestTab("out")}>
          {out == "" && <p>Execute test script to generate output.</p>}
          <Editor
            value={out}
            onChange={() => {
              return;
            }}
            language={"cmp"}
            disabled={true}
            lineNumberTransform={(_) => ""}
          />
        </Tab>
        <Tab title="Diff Table" onSelect={() => setSelectedTestTab("diff")}>
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
            lineNumberTransform={(i) => diffDisplay?.lineNumbers[i - 1] ?? ""}
            customDecorations={diffDisplay?.decorations.map((decoration) => {
              return {
                span: decoration.span,
                cssClass: decorationTypeToCss(decoration.type),
              };
            })}
          />
        </Tab>
      </TabList>
    </Panel>
  );
};

function decorationTypeToCss(type: DecorationType) {
  switch (type) {
    case "error-line":
      return "diff-highlight-line-1";
    case "error-cell":
      return "diff-highlight-cell-1";
    case "correct-line":
      return "diff-highlight-line-2";
    case "correct-cell":
      return "diff-highlight-cell-2";
    default:
      return "";
  }
}
