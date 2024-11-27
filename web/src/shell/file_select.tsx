import { FileSystem, Stats } from "@davidsouther/jiffies/lib/esm/fs";
import { t, Trans } from "@lingui/macro";
import { useDialog } from "@nand2tetris/components/dialog";
import { sortFiles } from "@nand2tetris/components/file_utils";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import type JSZip from "jszip";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppContext } from "../App.context";
import { Icon } from "../pico/icon";
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

export function isPath(obj: unknown): obj is Path {
  return (obj as Path).path != undefined && (obj as Path).isDir != undefined;
}

export interface Path {
  path: string;
  isDir: boolean;
}

// Selecting a file from the file picker would always return a Path on which we can use fs.readFile / fs.scandir later.
// In the case of local files, we have to load them on selection, and will return either a LocalFile or LocalFile[] in case of file/folder respectively.
export type FileSelectionRef = Path | LocalFile | LocalFile[];

export function useFilePicker() {
  const dialog = useDialog();
  const [suffix, setSuffix] = useState<string[]>();
  const [allowFolders, setAllowFolders] = useState(false);

  const allowLocal = useRef(false);

  const selected = useRef<(v: FileSelectionRef) => void>();

  const _select = useCallback(
    async (options: FilePickerOptions): Promise<FileSelectionRef> => {
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
    return (await _select(options)) as Path;
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

export const FilePicker = () => {
  const { fs, setStatus, localFsRoot } = useContext(BaseContext);
  const { filePicker } = useContext(AppContext);

  const [files, setFiles] = useState<Stats[]>([]);
  const [chosen, setFile] = useState<Path>({ path: fs.cwd(), isDir: true });
  const cwd = fs.cwd();

  const getFiles = (files: Stats[]) => {
    return fs.cwd() != "/"
      ? [
          { isFile: () => false, isDirectory: () => true, name: ".." },
          ...sortFiles(files),
        ]
      : sortFiles(files);
  };

  useEffect(() => {
    if (!localFsRoot && fs.cwd() == "/") {
      cd("projects");
    }
    setFile({ path: fs.cwd(), isDir: true });
  }, [fs]);

  useEffect(() => {
    fs.scandir(fs.cwd()).then((files) => {
      setFiles(getFiles(files));
    });
  }, [fs, cwd, setFiles]);

  const cd = useCallback(
    (dir: string) => {
      fs.cd(dir);
      fs.scandir(fs.cwd()).then((files) => {
        setFiles(getFiles(files));
      });
    },
    [fs, setFile, setFiles],
  );

  const select = useCallback(
    (basename: string, isDir: boolean) => {
      setFile({
        path: `${fs.cwd() == "/" ? "" : fs.cwd()}/${basename}`,
        isDir,
      });
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
    if (
      !loadRef.current ||
      !loadRef.current.files ||
      loadRef.current.files.length == 0
    ) {
      return;
    }

    const files: LocalFile[] = [];
    for (const file of loadRef.current.files) {
      files.push({
        name: file.name,
        content: await file.text(),
      });
    }

    filePicker[Selected].current?.(files.length == 1 ? files[0] : files);
    filePicker.close();
  };

  const downloadRef = useRef<HTMLAnchorElement>(null);
  const downloadFolder = async () => {
    if (!downloadRef.current) {
      return;
    }

    const zip = await newZip();
    await buildZip(zip, fs, chosen.path);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    downloadRef.current.href = url;
    downloadRef.current.download = chosen.path.split("/").pop() ?? chosen.path;
    downloadRef.current.click();

    URL.revokeObjectURL(url);
  };

  const chosenFileName = useMemo(() => {
    return chosen.path.split("/").pop();
  }, [chosen]);

  return (
    <dialog open={filePicker.isOpen}>
      <input
        type="file"
        ref={loadRef}
        onChange={onLoadLocal}
        style={{ display: "none" }}
        webkitdirectory={filePicker.allowFolders ? "true" : undefined}
      ></input>
      <article className="file-select flex">
        <header>
          <p>
            <Trans>{t`Choose file`}</Trans>
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
            {t`close`}
          </a>
        </header>
        <main>
          <a ref={downloadRef} style={{ display: "none" }} />
          <div>
            <b>{fs.cwd()}</b>
          </div>
          <div className="flex wrap files-container">
            {files.map((file) => (
              <FileEntry
                key={file.name}
                stats={file}
                highlighted={file.name === chosenFileName}
                onClick={() => select(file.name, file.isDirectory())}
                onDoubleClick={() => {
                  if (file.isDirectory()) {
                    cd(file.name);
                  }
                }}
                disabled={
                  !(file.name == "..") &&
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
              chosen.path == ".." ||
              (filePicker.suffix != undefined &&
                chosen.path.includes(".") &&
                !isFileValid(chosen.path, filePicker.suffix)) ||
              (!filePicker.allowFolders && !chosen.path.includes("."))
            }
            onClick={confirm}
          >
            {t`Select`}
          </button>
          {!localFsRoot && filePicker.allowLocal && (
            <button onClick={loadLocal}>Select local file</button>
          )}
          {!localFsRoot && (
            <button
              onClick={downloadFolder}
              data-tooltip={t`Download all files in this folder into a zip`}
              disabled={chosen.path == "" || chosen.path.includes(".")}
            >
              {t`Download`}
            </button>
          )}
        </footer>
      </article>
    </dialog>
  );
};
