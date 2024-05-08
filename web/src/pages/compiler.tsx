import { unwrap } from "@davidsouther/jiffies/lib/esm/result";
import { Trans } from "@lingui/macro";
import { useCompilerPageStore } from "@nand2tetris/components/stores/compiler.store";
import { compile } from "@nand2tetris/simulator/jack/compiler.js";
import { VmFile } from "@nand2tetris/simulator/test/vmtst";
import JSZip from "jszip";
import {
  CSSProperties,
  ChangeEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Link } from "react-router-dom";
import URLs from "src/urls";
import { AppContext } from "../App.context";
import { Editor } from "../shell/editor";
import { Panel } from "../shell/panel";
import "./compiler.scss";

export const Compiler = () => {
  const { tracking, toolStates, setTitle } = useContext(AppContext);
  const { state, dispatch, actions } = useCompilerPageStore();

  const uploadRef = useRef<HTMLInputElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const redirectRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    actions.initialize();
  }, [actions]);

  useEffect(() => {
    setTitle(toolStates.compiler.title);
  });

  const selectTab = useCallback(
    (tab: string) => {
      dispatch.current({ action: "setSelected", payload: tab });
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking]
  );

  const uploadFiles = () => {
    uploadRef.current?.click();
  };

  const loadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length == 0) {
      return;
    }
    await actions.reset();
    for (const file of event.target.files) {
      if (file.name.endsWith(".jack")) {
        const source = await file.text();
        actions.addFile(file.name.replace(".jack", ""), source);
      }
    }

    const dirName = event.target.files[0].webkitRelativePath.split("/")[0];
    toolStates.compiler.setTitle(`Folder name: ${dirName}`);
  };

  const valid = () =>
    Object.keys(state.files)
      .map((file) => state.files[file].valid)
      .reduce((a, b) => a && b, true);

  const compileAll = (): VmFile[] => {
    const files = [];
    for (const file of Object.keys(state.files)) {
      let compiled = unwrap(compile(state.files[file].content));
      compiled = `// Compiled ${file}.jack:\n`.concat(compiled);
      files.push({ name: file, content: compiled });
    }
    return files;
  };

  const compileAndDownload = async () => {
    if (!downloadRef.current) {
      return;
    }

    const zip = new JSZip();

    for (const file of compileAll()) {
      zip.file(`${file.name}.vm`, file.content);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    downloadRef.current.href = url;
    downloadRef.current.download = `VmCode`;
    downloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const runInVm = () => {
    toolStates.vm.setTitle(toolStates.compiler.title);
    toolStates.vm.setFiles(compileAll());
    redirectRef.current?.click();
  };

  return (
    <div className="Page CompilerPage grid">
      <a style={{ display: "none" }} ref={downloadRef}></a>
      <input
        style={{ display: "none" }}
        ref={uploadRef}
        type="file"
        webkitdirectory=""
        onChange={loadFiles}
      />
      <Link
        ref={redirectRef}
        to={URLs["vm"].href}
        style={{ display: "none" }}
      />
      <Panel
        className="code"
        header={
          <>
            <div>
              <Trans>Source</Trans>
            </div>
            <div className="flex-1">
              <fieldset role="group">
                <button className="flex-0" onClick={uploadFiles}>
                  📂
                </button>
                <button
                  className="flex-0"
                  disabled={!valid()}
                  data-tooltip="Compiles into VM code and invokes the VM emulator"
                  data-placement="right"
                  onClick={runInVm}
                >
                  Compile
                </button>
                <button
                  className="flex-0"
                  disabled={!valid()}
                  data-tooltip="Downloads the compiled VM code"
                  data-placement="bottom"
                  onClick={compileAndDownload}
                >
                  Download
                </button>
              </fieldset>
            </div>
          </>
        }
      >
        <div
          role="tablist"
          style={
            {
              "--tab-count": `${Object.keys(state.files).length}`,
            } as CSSProperties
          }
        >
          {Object.keys(state.files).map((file) => (
            <>
              <div
                key={`tab-${file}`}
                role="tab"
                id={`jack-tab-${file}`}
                aria-controls={`jack-tabpanel-${file}`}
                aria-selected={state.selected === file}
              >
                <label>
                  <input
                    type="radio"
                    name="tabs"
                    aria-controls={`jack-tabpanel-${file}`}
                    value={file}
                    checked={state.selected === file}
                    onChange={() => selectTab(file)}
                  />
                  {file}.jack
                </label>
              </div>
              <div
                key={`tabpanel-${file}`}
                role="tabpanel"
                aria-labelledby={`jack-tab-${file}`}
                id={`jack-tabpanel-${file}`}
              >
                <Editor
                  value={state.files[file].content}
                  disabled={true}
                  onChange={(source: string) => {
                    return;
                  }}
                  error={state.files[file].error}
                  language={""}
                />
              </div>
            </>
          ))}
        </div>
      </Panel>
    </div>
  );
};

export default Compiler;
