import { Trans } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { useCompilerPageStore } from "@nand2tetris/components/stores/compiler.store";
import { VmFile } from "@nand2tetris/simulator/test/vmtst";
import JSZip from "jszip";
import { ChangeEvent, useCallback, useContext, useEffect, useRef } from "react";
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

  const uploadRef = useRef<HTMLInputElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const redirectRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    setTitle(toolStates.compiler.title);
  });

  useEffect(() => {
    actions.loadFiles(toolStates.compiler.files);
  }, [actions, toolStates.compiler.files]);

  useEffect(() => {
    if (toolStates.compiler.compiled) {
      setStatus(
        valid()
          ? "Compiled successfully"
          : state.compiled[state.selected].error?.message ?? ""
      );
    }
  });

  const selectTab = useCallback(
    (tab: string) => {
      dispatch.current({ action: "setSelected", payload: tab });
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking]
  );

  const uploadFiles = () => {
    if (uploadRef.current) {
      uploadRef.current.value = "";
      uploadRef.current.click();
    }
  };

  const loadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length == 0) {
      return;
    }
    await actions.reset();
    const files: Record<string, string> = {};
    for (const file of event.target.files) {
      if (file.name.endsWith(".jack")) {
        const source = await file.text();
        const name = file.name.replace(".jack", "");
        files[name] = source;
      }
    }
    await actions.loadFiles(files);

    const dirName = event.target.files[0].webkitRelativePath.split("/")[0];
    toolStates.compiler.setTitle(`${dirName} / *.jack`);
    toolStates.compiler.setCompiled(false);
    toolStates.compiler.setFiles(files);
    setStatus("");
  };

  const valid = () =>
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
    toolStates.compiler.setCompiled(true);
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
    downloadRef.current.download = `VMcode`;
    downloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const runInVm = () => {
    toolStates.vm.setTitle(toolStates.compiler.title?.replace("jack", "vm"));
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
            <div className="flex row flex-1">
              <button className="flex-0" onClick={uploadFiles}>
                📂
              </button>
              <button
                className="flex-0"
                data-tooltip="Compiles into VM code"
                data-placement="bottom"
                onClick={compileFiles}
                disabled={Object.keys(state.files).length == 0}
              >
                Compile
              </button>
              <button
                className="flex-0"
                disabled={!toolStates.compiler.compiled || !valid()}
                data-tooltip="Loads the compiled code into the VM emulators"
                data-placement="right"
                onClick={runInVm}
              >
                Run
              </button>
              <button
                className="flex-0"
                disabled={!toolStates.compiler.compiled || !valid()}
                data-tooltip="Downloads the compiled VM code"
                data-placement="bottom"
                onClick={compileAndDownload}
              >
                Download
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
                backgroundColor:
                  toolStates.compiler.compiled && !state.compiled[file].valid
                    ? "#ffaaaa"
                    : undefined,
              }}
            >
              <Editor
                value={state.files[file]}
                disabled={true}
                onChange={(source: string) => {
                  return;
                }}
                error={
                  toolStates.compiler.compiled
                    ? state.compiled[file].error
                    : undefined
                }
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
