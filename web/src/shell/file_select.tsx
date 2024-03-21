import { FileSystem, Stats } from "@davidsouther/jiffies/lib/esm/fs";
import { Trans } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import JSZip from "jszip";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App.context";
import { Icon } from "../pico/icon";
import { useDialog } from "./dialog";

// export const Selected = Symbol.for("file selected");
export const Selected = "file selected";

export function useFilePicker() {
  const dialog = useDialog();
  const [suffix, setSuffix] = useState<string[]>();
  const [allowFolders, setAllowFolders] = useState(false);

  const selected = useRef<(v: string) => void>();

  const select = useCallback(
    async (
      suffix?: string | string[],
      allowFolders = false
    ): Promise<string> => {
      if (typeof suffix === "string") {
        suffix = [suffix];
      }
      setSuffix(suffix);
      setAllowFolders(allowFolders);
      dialog.open();
      return new Promise((resolve) => {
        selected.current = resolve;
      });
    },
    [dialog, selected]
  );

  return {
    ...dialog,
    select,
    [Selected]: selected,
    suffix: suffix,
    allowFolders,
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
          color: disabled ? "var(--light-grey)" : undefined,
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
  const { fs, setStatus } = useContext(BaseContext);
  const { filePicker } = useContext(AppContext);

  const [files, setFiles] = useState<Stats[]>([]);
  const [chosen, setFile] = useState("");
  const cwd = fs.cwd();

  useEffect(() => {
    fs.scandir(fs.cwd()).then((files) => {
      setFiles(files);
    });
  }, [fs, cwd, setFiles]);

  const cd = useCallback(
    (dir: string) => {
      fs.cd(dir);
      fs.scandir(fs.cwd()).then((files) => {
        setFiles(files);
      });
    },
    [fs, setFile, setFiles]
  );

  const select = useCallback(
    (basename: string) => {
      setFile(`${fs.cwd() == "/" ? "" : fs.cwd()}/${basename}`);
    },
    [setFile]
  );

  const confirm = useCallback(() => {
    setStatus(`Selected ${chosen}`);
    filePicker.close();
    filePicker[Selected].current?.(chosen);
  }, [chosen, filePicker, setStatus]);

  const downloadRef = useRef<HTMLAnchorElement>(null);
  const downloadFolder = async () => {
    if (!downloadRef.current) {
      return;
    }

    const zip = new JSZip();
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
      <article style={{ width: "400px" }}>
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
          <button
            onClick={downloadFolder}
            data-tooltip="Download all files in this folder into a zip"
            disabled={chosen == "" || chosen.includes(".")}
          >
            Download
          </button>
        </footer>
      </article>
    </dialog>
  );
};
