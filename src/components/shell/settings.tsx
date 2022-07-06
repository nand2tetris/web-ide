import { createContext, useContext, useEffect, useState } from "react";
import { StorageContext } from "../../util/storage";
import * as projects from "../../projects";
import { Subject } from "rxjs";

export const SettingsContext = createContext<{ open: Subject<void> }>({
  open: new Subject(),
});

export const Settings = () => {
  const fs = useContext(StorageContext);
  const settings = useContext(SettingsContext);

  const [open, setOpen] = useState(false);
  useEffect(() => {
    const subscription = settings.open.subscribe(() => {
      setOpen(true);
    });
    return () => subscription.unsubscribe();
  }, [settings.open]);

  return (
    <dialog open={open}>
      <article>
        <header>
          <p>Settings</p>
          <a
            className="close"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          ></a>
        </header>
        <main>
          <dl>
            <header>Project</header>
            <dt>Files</dt>
            <dd>
              <button
                onClick={() => {
                  localStorage["chip/project"] = "01";
                  localStorage["chip/chip"] = "Not";
                  projects.resetFiles(fs);
                  // statusLine.update("Reset files in local storage");
                }}
              >
                Reset
              </button>
              <button
                onClick={(e) => {
                  projects.loadSolutions(fs);
                  // statusLine.update("Loaded sample solutions...");
                }}
              >
                Solutions
              </button>
            </dd>
            <dt>References</dt>
            <dd>
              <a
                href="https://github.com/davidsouther/computron5k"
                target="_blank"
                rel="noreferrer"
              >
                Github
              </a>
            </dd>
            <dd>
              <a
                href="https://davidsouther.github.io/computron5k/user_guide"
                target="_blank"
                rel="noreferrer"
              >
                User Guide
              </a>
            </dd>
          </dl>
        </main>
      </article>
    </dialog>
  );
  // dt("Numeric Format"),
  // dd(
  //   ButtonBar({
  //     value: "B",
  //     values: ["B", "D", "X", "A"],
  //     events: {
  //       onSelect: () => {},
  //     },
  //   })
  // )
};
