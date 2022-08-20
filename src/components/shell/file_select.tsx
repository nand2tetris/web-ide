import { Stats } from "@davidsouther/jiffies/lib/esm/fs";
import { Trans } from "@lingui/macro";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../App.context";

export const FilePicker = () => {
  const { fs, filePicker, setStatus } = useContext(AppContext);

  const [files, setFiles] = useState<Stats[]>([]);
  const [chosen, setFile] = useState("");

  useEffect(() => {
    fs.scandir(fs.cwd()).then((files) => {
      setFiles(files);
    });
  }, [fs, fs.cwd(), setFiles]);

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
    [fs, setFile]
  );

  const confirm = useCallback(async () => {
    const contents = await fs.readFile(chosen);
    setStatus(`Read ${chosen} (${contents.length})`);
    filePicker.close();
  }, []);

  return (
    <dialog open={filePicker.isOpen}>
      <article>
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
            {" "}
            <b>{fs.cwd()}</b>
          </div>
          <ul>
            {fs.cwd() != "/" && (
              <li>
                <a href="#" onClick={() => cd("..")}>
                  ..
                </a>
              </li>
            )}
            {files.map((file) => (
              <li key={file.name}>
                <a
                  style={{
                    backgroundColor:
                      file.name === chosen ? "var(--mark-color)" : "none",
                  }}
                  href="#"
                  onClick={() =>
                    file.isDirectory() ? cd(file.name) : select(file.name)
                  }
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </main>
        {chosen && (
          <footer>
            <button onClick={confirm}>Select</button>
          </footer>
        )}
      </article>
    </dialog>
  );
};
