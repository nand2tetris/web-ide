import { Trans } from "@lingui/macro";
import { useMemo, useContext, useEffect } from "react";
import { i18n } from "@lingui/core";
import * as projects from "../../projects";
import { AppContext } from "../../App.context";

import "../pico/button-group.scss";

export const Settings = () => {
  const { settings, fs, monaco, theme, setTheme } = useContext(AppContext);

  const writeLocale = useMemo(
    () => (locale: string) => {
      i18n.activate(locale);
      fs.writeFile("/locale", locale);
    },
    [fs]
  );

  useEffect(() => {
    fs.readFile("/locale")
      .then((locale) => i18n.activate(locale))
      .catch(() => writeLocale("en"));
  }, [fs, writeLocale]);

  return (
    <dialog open={settings.isOpen}>
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
              settings.close();
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
            <dt>
              <Trans>Editor</Trans>
            </dt>
            <dd>
              <label htmlFor="monaco_editor_switch">
                <input
                  type="checkbox"
                  id="monaco_editor_switch"
                  name="switch"
                  role="switch"
                  checked={monaco.wants}
                  disabled={!monaco.canUse}
                  onChange={(e) => monaco.toggle(e.target.checked)}
                />
                Use Monaco Editor
              </label>
            </dd>
            <dt>
              <Trans>Theme</Trans>
            </dt>
            <dd>
              <fieldset role="group">
                <label role="button" aria-current={theme === "light"}>
                  <input
                    type="radio"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={() => setTheme("light")}
                  />
                  <Trans>Light</Trans>
                </label>
                <label role="button" aria-current={theme === "dark"}>
                  <input
                    type="radio"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={() => setTheme("dark")}
                  />
                  <Trans>Dark</Trans>
                </label>
                <label role="button" aria-current={theme === "system"}>
                  <input
                    type="radio"
                    name="theme"
                    value="system"
                    checked={theme === "system"}
                    onChange={() => setTheme("system")}
                  />
                  <Trans>System</Trans>
                </label>
              </fieldset>
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
