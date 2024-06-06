import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import { Trans, t } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import {
  FileSystemAccessFileSystemAdapter,
  openNand2TetrisDirectory,
} from "@nand2tetris/components/stores/base/fs.js";
import { useCompilerPageStore } from "@nand2tetris/components/stores/compiler.store";
import { VmFile } from "@nand2tetris/simulator/test/vmtst";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDialog } from "src/shell/dialog";
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

  const [selected, setSelected] = useState(0);

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

  const onSelect = useCallback(
    (tab: string) => {
      dispatch.current({ action: "setSelected", payload: tab });
      tracking.trackEvent("tab", "change", tab);
    },
    [tracking],
  );

  useEffect(() => {
    setSelected(Object.keys(state.files).indexOf(state.selected));
  }, [state.selected]);

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

  const isNameValid = (name: string) => {
    return (
      (name?.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) &&
        !Object.keys(state.files).includes(name)) ??
      false
    );
  };

  const newFileDialog = useDialog();

  const createFile = () => {
    if (!state.fs) {
      setStatus("No project folder loaded");
      return;
    }
    newFileDialog.open();
  };

  const onCreateFile = async (name?: string) => {
    if (name) {
      await actions.writeFile(name);
      onSelect(name);
    }
  };

  const newFileDialogComponent = (
    <NameDialog
      title="Create New File"
      buttonText={"Create"}
      dialog={newFileDialog}
      isValid={isNameValid}
      onExit={onCreateFile}
    />
  );

  return (
    <div className="Page CompilerPage grid">
      <Link
        ref={redirectRef}
        to={URLs["vm"].href}
        style={{ display: "none" }}
      />
      {newFileDialogComponent}
      <Panel
        className="code"
        header={
          <>
            <div>
              <Trans>Source</Trans>
            </div>
            <div className="flex row flex-1">
              <button
                data-tooltip={t`Open a folder containing Jack file(s)`}
                data-placement="right"
                className="flex-0"
                onClick={uploadFiles}
              >
                📂
              </button>
              <Padding />
              <button
                data-tooltip={t`Create a new file in the currently opened folder`}
                data-placement="right"
                className="flex-0"
                onClick={createFile}
              >
                +
              </button>
              <Padding />
              <button
                className="flex-0"
                data-tooltip={`Compile all the opened Jack files`}
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
                data-tooltip={t`Load the compiled code into the VM emulator`}
                data-placement="bottom"
                onClick={runInVm}
              >
                Run
              </button>
            </div>
          </>
        }
      >
        <TabList tabIndex={{ value: selected, set: setSelected }}>
          {Object.keys(state.files).map((file) => (
            <Tab
              title={`${file}.jack`}
              key={file}
              onSelect={() => onSelect(file)}
              style={{
                backgroundColor: !state.compiled[file].valid
                  ? "#ffaaaa"
                  : undefined,
              }}
            >
              <Editor
                value={state.files[file]}
                onChange={(source: string) => {
                  toolStates.compiler.setCompiled(false);
                  actions.writeFile(file, source);
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

const NameDialog = ({
  title,
  buttonText,
  dialog,
  isValid,
  onExit,
}: {
  title: string;
  buttonText: string;
  dialog: ReturnType<typeof useDialog>;
  isValid: (value: string) => boolean;
  onExit: (value?: string) => void;
}) => {
  const [value, setValue] = useState<string>();

  return (
    <dialog open={dialog.isOpen}>
      <article>
        <header>
          <Trans>{title}</Trans>
          <a
            className="close"
            href="#root"
            onClick={(e) => {
              e.preventDefault();
              onExit();
              dialog.close();
            }}
          />
        </header>
        <main>
          <div className="flex row">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
            ></input>
            <span>.jack</span>
          </div>
          <button
            disabled={!isValid(value ?? "")}
            onClick={() => {
              dialog.close();
              setValue("");
              onExit(value);
            }}
          >
            {buttonText}
          </button>
        </main>
      </article>
    </dialog>
  );
};
