import { Stats } from "@davidsouther/jiffies/lib/esm/fs";
import { Trans } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../App.context";
import { Icon } from "../pico/icon";
import { useDialog } from "./dialog";

// export const Selected = Symbol.for("file selected");
export const Selected = "file selected";

export function useFilePicker() {
  const dialog = useDialog();
  const [suffix, setSuffix] = useState<string>();

  const selected = useRef<(v: string) => void>();

  const select = useCallback(
    async (suffix?: string): Promise<string> => {
      setSuffix(suffix);
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
    suffix,
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
      setFile(`${fs.cwd()}/${basename}`);
    },
    [setFile]
  );

  const confirm = useCallback(() => {
    setStatus(`Selected ${chosen}`);
    filePicker.close();
    filePicker[Selected].current?.(chosen);
  }, [chosen, filePicker, setStatus]);

  return (
    <dialog open={filePicker.isOpen}>
      <article style={{ width: "350px" }}>
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
                !file.name.endsWith(filePicker.suffix)
              }
            />
          ))}
        </main>
        <footer>
          <button
            disabled={
              !chosen ||
              (filePicker.suffix != undefined &&
                !chosen.endsWith(filePicker.suffix))
            }
            onClick={confirm}
          >
            Select
          </button>
        </footer>
      </article>
    </dialog>
  );
};
