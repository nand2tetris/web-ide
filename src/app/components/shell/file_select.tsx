import { Stats } from "@davidsouther/jiffies/lib/esm/fs";
import { Trans } from "@lingui/macro";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../App.context";
import { Icon } from "../pico/icon";
import { useDialog } from "./dialog";

const Selected = Symbol.for("file selected");

export function useFilePicker() {
  const dialog = useDialog();

  const selected = useRef<(v: string) => void>();

  const select = useCallback(async (): Promise<string> => {
    dialog.open();
    return new Promise((resolve, reject) => {
      selected.current = resolve;
    });
  }, [dialog, selected]);

  return {
    ...dialog,
    select,
    [Selected]: selected,
  };
}

const FileEntry = ({
  onSelect,
  stats,
  highlighted = false,
}: {
  stats: Stats;
  highlighted?: boolean;
  onSelect: () => void;
}) => (
  <div>
    <button
      className={`flex row justify-start outline ${
        highlighted ? "" : "secondary"
      }`}
      style={{ textAlign: "left" }}
      onClick={onSelect}
    >
      <Icon name={stats.isDirectory() ? "folder" : "draft"} />
      {stats.name}
    </button>
  </div>
);

export const FilePicker = () => {
  const { fs, filePicker, setStatus } = useContext(AppContext);

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
      setFile("");
      fs.cd(dir);
      fs.scandir(fs.cwd()).then((files) => {
        setFiles(files);
      });
    },
    [fs, setFile, setFiles]
  );

  const select = useCallback(
    (basename: string) => {
      setFile(basename);
    },
    [setFile]
  );

  const confirm = useCallback(() => {
    // const contents = await fs.readFile(chosen);
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
              onSelect={() => cd("..")}
            />
          )}
          {files.map((file) => (
            <FileEntry
              key={file.name}
              stats={file}
              highlighted={file.name === chosen}
              onSelect={() =>
                file.isDirectory() ? cd(file.name) : select(file.name)
              }
            />
          ))}
        </main>
        <footer>
          <button disabled={!chosen} onClick={confirm}>
            Select
          </button>
        </footer>
      </article>
    </dialog>
  );
};
