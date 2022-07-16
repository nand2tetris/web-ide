import { Trans } from "@lingui/macro";
import { useMemo, useContext, useEffect, useState } from "react";
import { i18n } from "@lingui/core";
import * as projects from "../../projects";
import { AppContext } from "../../App.context";

export const Settings = () => {
  const { settings, fs } = useContext(AppContext);

  const [open, setOpen] = useState(false);

  const writeLocale = useMemo(
    () => (locale: string) => {
      i18n.activate(locale);
      fs.writeFile("/locale", locale);
    },
    [fs]
  );

  useEffect(() => {
    const subscription = settings.open.subscribe(() => {
      setOpen(true);
    });
    fs.readFile("/locale")
      .then((locale) => i18n.activate(locale))
      .catch(() => writeLocale("en"));
    return () => subscription.unsubscribe();
  }, [settings.open, fs, writeLocale]);

  return (
    <dialog open={open}>
      <article>
        <header>
          <p>
            <Trans>Settings</Trans>
          </p>
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
            <header>
              <Trans>Project</Trans>
            </header>
            <dt>
              <Trans>Files</Trans>
            </dt>
            <dd>
              <button
                onClick={async () => {
                  localStorage.clear();
                  localStorage["/chip/project"] = "01";
                  localStorage["/chip/chip"] = "Not";
                  await projects.resetFiles(fs);
                  // statusLine.update("Reset files in local storage");
                }}
              >
                <Trans>Reset</Trans>
              </button>
              <button
                onClick={() => {
                  projects.loadSolutions(fs);
                  // statusLine.update("Loaded sample solutions...");
                }}
              >
                <Trans>Solutions</Trans>
              </button>
            </dd>
            <dt>
              <Trans>References</Trans>
            </dt>
            <dd>
              <a
                href="https://github.com/davidsouther/computron5k"
                target="_blank"
                rel="noreferrer"
              >
                <Trans>Github</Trans>
              </a>
            </dd>
            <dt>
              <Trans>Language</Trans>
            </dt>
            <dd>
              <button onClick={() => writeLocale("en")}>
                <Trans>English</Trans>
              </button>
              <button onClick={() => writeLocale("en-PL")}>
                <Trans>Pseudolocale</Trans>
              </button>
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
