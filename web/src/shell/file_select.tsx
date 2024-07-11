import { FileSystem, Stats } from "@davidsouther/jiffies/lib/esm/fs";
import { Trans } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import type JSZip from "jszip";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App.context";
import { Icon } from "../pico/icon";
import { useDialog } from "./dialog";
import "./file_select.scss";
import { newZip } from "./zip";

export const Selected = "file selected";

export interface FilePickerOptions {
  suffix?: string | string[];
  allowFolders?: boolean;
}

export interface LocalFile {
  name: string;
  content: string;
}

export function useFilePicker() {
  const dialog = useDialog();
  const [suffix, setSuffix] = useState<string[]>();
  const [allowFolders, setAllowFolders] = useState(false);

  const allowLocal = useRef(false);

  const selected = useRef<(v: string | LocalFile) => void>();

  const _select = useCallback(
    async (options: FilePickerOptions): Promise<string | LocalFile> => {
      if (typeof options.suffix === "string") {
        options.suffix = [options.suffix];
      }
      setSuffix(options.suffix);
      setAllowFolders(options.allowFolders ?? false);
      dialog.open();
      return new Promise((resolve) => {
        selected.current = resolve;
      });
    },
    [dialog, selected],
  );

  const select = async (options: FilePickerOptions) => {
    allowLocal.current = false;
    return (await _select(options)) as string;
  };

  const selectAllowLocal = async (options: FilePickerOptions) => {
    allowLocal.current = true;
    return _select(options);
  };

  return {
    ...dialog,
    select,
    selectAllowLocal,
    [Selected]: selected,
    suffix: suffix,
    allowFolders,
    allowLocal: allowLocal.current,
  };
}

const FileEntry = ({
  onClick,
  onDoubleClick,
  stats,
  highlighted = false,
  disabled = false,
}: {
  stats: Stats;
  highlighted?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) => {
  const onClickCB = (event: { detail: number }) => {
    if (event.detail == 1) {
      onClick?.();
    } else if (event.detail == 2) {
      onDoubleClick?.();
    }
  };

  return (
    <div>
      <button
        className={`flex row justify-start outline ${
          highlighted ? "" : "secondary"
        }`}
        style={{
          textAlign: "left",
          color: disabled ? "var(--disabled)" : undefined,
        }}
        onClick={onClickCB}
      >
        <Icon name={stats.isDirectory() ? "folder" : "draft"} />
        {stats.name}
      </button>
    </div>
  );
};

async function buildZip(zip: JSZip, fs: FileSystem, cwd: string) {
  for (const entry of await fs.scandir(cwd)) {
    if (entry.isDirectory()) {
      const folder = zip.folder(entry.name);
      if (folder) {
        await buildZip(folder, fs, `${cwd}/${entry.name}`);
      }
    } else {
      zip.file(entry.name, await fs.readFile(`${cwd}/${entry.name}`));
    }
  }
}

function isFileValid(filename: string, validSuffixes: string[]) {
  return validSuffixes
    .map((suffix) => filename.endsWith(suffix))
    .reduce((p1, p2) => p1 || p2, false);
}

function sortFiles(files: Stats[]) {
  return files.sort((a, b) => {
    const aIsNum = /^\d+$/.test(a.name);
    const bIsNum = /^\d+$/.test(b.name);
    if (aIsNum && !bIsNum) {
      return -1;
    } else if (!aIsNum && bIsNum) {
      return 1;
    } else if (aIsNum && bIsNum) {
      return parseInt(a.name) - parseInt(b.name);
    } else {
      return a.name.localeCompare(b.name);
    }
  });
}

export const FilePicker = () => {
  const { fs, setStatus, localFsRoot } = useContext(BaseContext);
  const { filePicker } = useContext(AppContext);

  const [files, setFiles] = useState<Stats[]>([]);
  const [chosen, setFile] = useState("");
  const cwd = fs.cwd();

  useEffect(() => {
    setFile("");
    if (!localFsRoot && fs.cwd() == "/") {
      cd("projects");
    }
  }, [fs]);

  useEffect(() => {
    fs.scandir(fs.cwd()).then((files) => {
      setFiles(sortFiles(files));
    });
  }, [fs, cwd, setFiles]);

  const cd = useCallback(
    (dir: string) => {
      fs.cd(dir);
      fs.scandir(fs.cwd()).then((files) => {
        setFiles(sortFiles(files));
      });
    },
    [fs, setFile, setFiles],
  );

  const select = useCallback(
    (basename: string) => {
      setFile(`${fs.cwd() == "/" ? "" : fs.cwd()}/${basename}`);
    },
    [setFile, fs],
  );

  const confirm = useCallback(() => {
    filePicker.close();
    filePicker[Selected].current?.(chosen);
  }, [chosen, filePicker, setStatus]);

  const loadRef = useRef<HTMLInputElement>(null);
  const loadLocal = () => {
    loadRef.current?.click();
  };

  const onLoadLocal = async () => {
    if (loadRef.current && loadRef.current.files) {
      const file = loadRef.current.files[0];
      filePicker[Selected].current?.({
        name: file.name,
        content: await file.text(),
      });
      filePicker.close();
    }
  };

  const downloadRef = useRef<HTMLAnchorElement>(null);
  const downloadFolder = async () => {
    if (!downloadRef.current) {
      return;
    }

    const zip = await newZip();
    await buildZip(zip, fs, chosen);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    downloadRef.current.href = url;
    downloadRef.current.download = chosen.split("/").pop() ?? chosen;
    downloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  return (
    <dialog open={filePicker.isOpen}>
      <input
        type="file"
        ref={loadRef}
        onChange={onLoadLocal}
        style={{ display: "none" }}
      ></input>
      <article className="file-select flex">
        <header>
          <p>
            <Trans>Choose file</Trans>
          </p>
          <a
            style={{ color: "rgba(0, 0, 0, 0)" }}
            className="close"
            href="#root"
            onClick={(e) => {
              e.preventDefault();
              filePicker.close();
            }}
          >
            close
          </a>
        </header>
        <main>
          <a ref={downloadRef} style={{ display: "none" }} />
          <div>
            <b>{fs.cwd()}</b>
          </div>
          <div className="flex wrap files-container">
            {fs.cwd() !== "/" && (
              <FileEntry
                stats={{
                  isDirectory() {
                    return true;
                  },
                  isFile() {
                    return false;
                  },
                  name: "..",
                }}
                onDoubleClick={() => cd("..")}
              />
            )}
            {files.map((file) => (
              <FileEntry
                key={file.name}
                stats={file}
                highlighted={file.name === chosen.split("/").pop()}
                onClick={() => select(file.name)}
                onDoubleClick={() => {
                  if (file.isDirectory()) {
                    cd(file.name);
                  }
                }}
                disabled={
                  file.name.includes(".") &&
                  filePicker.suffix != undefined &&
                  !isFileValid(file.name, filePicker.suffix)
                }
              />
            ))}
          </div>
        </main>
        <footer>
          <button
            disabled={
              !chosen ||
              chosen == ".." ||
              (filePicker.suffix != undefined &&
                chosen.includes(".") &&
                !isFileValid(chosen, filePicker.suffix)) ||
              (!filePicker.allowFolders && !chosen.includes("."))
            }
            onClick={confirm}
          >
            Select
          </button>
          {!localFsRoot && filePicker.allowLocal && (
            <button onClick={loadLocal}>Select local file</button>
          )}
          {!localFsRoot && (
            <button
              onClick={downloadFolder}
              data-tooltip="Download all files in this folder into a zip"
              disabled={chosen == "" || chosen.includes(".")}
            >
              Download
            </button>
          )}
        </footer>
      </article>
    </dialog>
  );
};
