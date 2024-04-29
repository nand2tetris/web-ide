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
  useState,
} from "react";
import { Link } from "react-router-dom";
import { useDialog } from "src/shell/dialog";
import URLs from "src/urls";
import { AppContext } from "../App.context";
import { Editor } from "../shell/editor";
import { Panel } from "../shell/panel";
import "./compiler.scss";

export const Compiler = () => {
  const { tracking, toolStates } = useContext(AppContext);
  const { state, dispatch, actions } = useCompilerPageStore();

  const uploadRef = useRef<HTMLInputElement>(null);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const redirectRef = useRef<HTMLAnchorElement>(null);

  const newFileDialog = useDialog();
  const renameDialog = useDialog();
  const deleteDialog = useDialog();

  useEffect(() => {
    actions.initialize();
  }, [actions]);

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
    if (!event.target.files) {
      return;
    }
    await actions.reset();
    for (const file of event.target.files) {
      if (file.name.endsWith(".jack")) {
        const source = await file.text();
        actions.addFile(file.name.replace(".jack", ""), source);
      }
    }
  };

  const valid = () =>
    Object.keys(state.files)
      .map((file) => state.files[file].valid)
      .reduce((a, b) => a && b, true);

  const compileAll = (): VmFile[] => {
    const files = [];
    for (const file of Object.keys(state.files)) {
      const compiled = unwrap(compile(state.files[file].content));
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
    downloadRef.current.download = `Jack`;
    downloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const runInVm = () => {
    toolStates.setVmState(compileAll());
    redirectRef.current?.click();
  };

  const isNameValid = (name: string) => {
    return (
      (name?.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) &&
        !Object.keys(state.files).includes(name)) ??
      false
    );
  };

  const newFileDialogComponent = (
    <NameDialog
      title="Create New File"
      buttonText={"Create"}
      dialog={newFileDialog}
      isValid={isNameValid}
      onExit={(name?: string) => {
        if (name) {
          actions.addFile(name);
        }
      }}
    />
  );

  const [current, setCurrent] = useState<string>();

  const renameDialogComponent = (
    <NameDialog
      title={`Rename ${current}.jack`}
      buttonText={"Rename"}
      dialog={renameDialog}
      isValid={isNameValid}
      onExit={(name?: string) => {
        if (name) {
          if (!current) {
            return;
          }
          actions.renameFile(current, name);
        }
      }}
    />
  );

  const deleteDialogComponent = (
    <dialog open={deleteDialog.isOpen}>
      <article>
        <header>
          <p>Are you sure you want to delete {current}.jack?</p>
        </header>
        <main>
          <button
            onClick={() => {
              deleteDialog.close();
            }}
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!current) {
                return;
              }
              await actions.deleteFile(current);
              deleteDialog.close();
            }}
          >
            Delete
          </button>
        </main>
      </article>
    </dialog>
  );

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
      {newFileDialogComponent}
      {renameDialogComponent}
      {deleteDialogComponent}
      <Panel
        className="files"
        header={
          <>
            <Trans>Files</Trans>
            <fieldset role="group">
              <button onClick={newFileDialog.open}>New</button>
              <button onClick={uploadFiles}>📂</button>
            </fieldset>
          </>
        }
      >
        {Object.keys(state.files).map((file) => (
          <FileEntry
            key={file}
            name={file}
            onRename={() => {
              setCurrent(file);
              renameDialog.open();
            }}
            onDelete={() => {
              setCurrent(file);
              deleteDialog.open();
            }}
          />
        ))}
      </Panel>
      <Panel
        className="code"
        header={
          <>
            <Trans>Source</Trans>
            <fieldset role="group">
              <button
                disabled={!valid()}
                data-tooltip="Run in VM Emulator"
                data-placement="left"
                onClick={runInVm}
              >
                ▶️
              </button>
              <button
                disabled={!valid()}
                data-tooltip="Download compiled code"
                data-placement="left"
                onClick={compileAndDownload}
              >
                ⬇️
              </button>
            </fieldset>
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
                  onChange={(source: string) => {
                    actions.editFile(file, source);
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

const FileEntry = ({
  name,
  onRename,
  onDelete,
}: {
  name: string;
  onRename: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="flex row file-entry">
      <span className="flex-1">{name}.jack</span>
      <a onClick={onRename}>✏️</a>
      <a onClick={onDelete}>🗑️</a>
    </div>
  );
};

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
            style={{ color: "rgba(0, 0, 0, 0)" }}
            className="close"
            href="#root"
            onClick={(e) => {
              e.preventDefault();
              onExit();
              dialog.close();
            }}
          >
            close
          </a>
        </header>
        <main>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
          ></input>
          <button
            disabled={!isValid(value ?? "")}
            onClick={() => {
              dialog.close();
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

export default Compiler;
