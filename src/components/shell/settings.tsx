import { useContext, useState } from "react";
import { StorageContext } from "../../util/storage";
import * as projects from "../../projects";

export const Settings = (props: { open: false }) => {
  const fs = useContext(StorageContext);
  // const statusLine = () => {};

  const [open, setOpen] = useState(props.open);

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
                onClick={(e) => {
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
