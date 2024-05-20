import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Trans } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import {
  FileSystemAccessFileSystemAdapter,
  openNand2TetrisDirectory,
} from "@nand2tetris/components/stores/base/fs.js";
import { useCompilerPageStore } from "@nand2tetris/components/stores/compiler.store";
import { VmFile } from "@nand2tetris/simulator/test/vmtst";
import { useCallback, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Editor } from "src/shell/editor";
import { Tab, TabList } from "src/shell/tabs";
import URLs from "src/urls";
import { AppContext } from "../App.context";
import { Panel } from "../shell/panel";
import "./compiler.scss";

export const Compiler = () => {
  const { setStatus } = useContext(BaseContext);
  const { tracking, toolStates, setTitle } = useContext(AppContext);
  const { state, dispatch, actions } = useCompilerPageStore();

  const redirectRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setTitle(toolStates.compiler.title);
  });

  useEffect(() => {
    if (toolStates.compiler.fs) {
      actions.loadProject(toolStates.compiler.fs);
    }
  }, [actions, toolStates.compiler.fs]);

  const showStatus = () => {
    const current = state.compiled[state.selected];
    if (current) {
      setStatus(current.valid ? "" : current.error?.message ?? "");
    }
  };

  useEffect(() => {
    showStatus();
  }, [state.selected, state.files]);

  const selectTab = useCallback(
    (tab: string) => {
      dispatch.current({ action: "setSelected", payload: tab });
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking]
  );

  const uploadFiles = async () => {
    const handle = await openNand2TetrisDirectory();
    const fs = new FileSystem(new FileSystemAccessFileSystemAdapter(handle));
    toolStates.compiler.setFs(fs);
    toolStates.compiler.setCompiled(false);
    toolStates.compiler.setTitle(`${handle.name} / *.jack`);
    setStatus("");
    actions.loadProject(fs);
  };

  const valid = () =>
    Object.keys(state.files).length == 0 ||
    Object.keys(state.files)
      .map((file) => state.compiled[file].valid)
      .reduce((a, b) => a && b, true);

  const compileAll = (): VmFile[] => {
    const files = [];
    for (const file of Object.keys(state.files)) {
      let compiled = state.compiled[file].vm ?? "";
      compiled = `// Compiled ${file}.jack:\n`.concat(compiled);
      files.push({ name: file, content: compiled });
    }
    return files;
  };

  const compileFiles = () => {
    if (valid()) {
      actions.compile();
      toolStates.compiler.setCompiled(true);
      setStatus("Compiled successfully");
    }
  };

  const runInVm = () => {
    toolStates.vm.setTitle(toolStates.compiler.title?.replace("jack", "vm"));
    toolStates.vm.setFiles(compileAll());
    redirectRef.current?.click();
  };

  return (
    <div className="Page CompilerPage grid">
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
            <div className="flex row flex-1">
              <button className="flex-0" onClick={uploadFiles}>
                📂
              </button>
              <Padding />
              <button
                className="flex-0"
                data-tooltip="Compiles into VM code"
                data-placement="bottom"
                onClick={compileFiles}
                disabled={!valid()}
              >
                Compile
              </button>
              <Padding />
              <button
                className="flex-0"
                disabled={!toolStates.compiler.compiled}
                data-tooltip="Loads the compiled code into the VM emulators"
                data-placement="right"
                onClick={runInVm}
              >
                Run
              </button>
            </div>
          </>
        }
      >
        <TabList>
          {Object.keys(state.files).map((file) => (
            <Tab
              title={`${file}.jack`}
              key={file}
              onSelect={() => selectTab(file)}
              style={{
                backgroundColor: !state.compiled[file].valid
                  ? "#ffaaaa"
                  : undefined,
              }}
            >
              <Editor
                value={state.files[file]}
                // disabled={true}
                onChange={(source: string) => {
                  toolStates.compiler.setCompiled(false);
                  actions.editFile(file, source);
                }}
                error={state.compiled[file].error}
                language={"jack"}
              />
            </Tab>
          ))}
        </TabList>
      </Panel>
    </div>
  );
};

export default Compiler;

function Padding() {
  return <div style={{ width: "0.25vw" }} />;
}