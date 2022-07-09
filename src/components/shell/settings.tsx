import { useContext, useEffect, useState } from "react";
import * as projects from "../../projects";
import { AppContext } from "../../App.context";

export const Settings = () => {
  const { settings, fs } = useContext(AppContext);

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
            style={{ color: "rgba(0, 0, 0, 0)" }}
            className="close"
            href="#root"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          >
            close
          </a>
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
                onClick={() => {
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
