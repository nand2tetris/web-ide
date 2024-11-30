import { i18n } from "@lingui/core";
import { Trans, t } from "@lingui/macro";
import { type FileSystem } from "@davidsouther/jiffies/lib/esm/fs";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import {
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  useRef,
} from "react";
import { AppContext } from "../App.context";

import { useDialog } from "@nand2tetris/components/dialog";
import { PageContext } from "src/Page.context";
import { newZip } from "./zip";
import "../pico/button-group.scss";
import "../pico/property.scss";
import { TrackingDisclosure } from "../tracking";
import { getVersion, setVersion } from "../versions";
import type JSZip from "jszip";
import { assertExists } from "@davidsouther/jiffies/lib/esm/assert";

const showUpgradeFs = true;

export const Settings = () => {
  const { stores } = useContext(PageContext);
  const {
    fs,
    setStatus,
    canUpgradeFs,
    upgradeFs,
    closeFs,
    localFsRoot,
    permissionPrompt,
    requestPermission,
    loadFs,
  } = useContext(BaseContext);
  const { settings, monaco, theme, setTheme, tracking } =
    useContext(AppContext);

  const [upgrading, setUpgrading] = useState(false);

  const upgradeFsAction = async (createFiles?: boolean) => {
    setUpgrading(true);
    try {
      await upgradeFs(localFsRoot != undefined, createFiles);
    } catch (err) {
      console.error("Failed to upgrade FS", { err });
      setStatus(t`Failed to load local file system.`);
    }
    setUpgrading(false);
  };

  const writeLocale = useMemo(
    () => (locale: string) => {
      if (localFsRoot) return;
      i18n.activate(locale);
      fs.writeFile("/locale", locale);
    },
    [fs],
  );

  useEffect(() => {
    if (localFsRoot) return;
    fs.readFile("/locale")
      .then((locale) => i18n.activate(locale))
      .catch(() => writeLocale("en"));
  }, [fs, writeLocale]);

  const resetWarning = useDialog();
  const resetConfirm = useDialog();

  const resetFiles = async () => {
    const version = getVersion();
    localStorage.clear();
    setVersion(version);
    localStorage["/chip/project"] = "01";
    localStorage["/chip/chip"] = "Not";
    const loaders = await import("@nand2tetris/projects/loader.js");
    await loaders.resetFiles(fs);

    stores.cpu.actions.clear();
    stores.asm.actions.clear();
    stores.vm.actions.initialize();
    stores.compiler.actions.reset();
  };

  const downloadRef = useRef<HTMLAnchorElement>(null);

  const downloadProjectFiles = useCallback(async () => {
    if (!downloadRef.current) {
      return;
    }

    const zip = await newZip();
    async function deepScan(fs: FileSystem, zip: JSZip, cwd = fs.cwd()) {
      for (const entry of await fs.scandir(cwd)) {
        const path = `${cwd}/${entry.name}`;
        if (entry.isFile()) {
          await zip.file(entry.name, fs.readFile(path));
        } else {
          await deepScan(
            fs,
            assertExists(await zip.folder(entry.name.padStart(2, "0"))),
            path,
          );
        }
      }
    }
    await deepScan(fs, zip);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);

    downloadRef.current.href = url;
    downloadRef.current.click();

    URL.revokeObjectURL(url);
  }, [fs]);

  const permissionPromptDialog = (
    <dialog open={permissionPrompt.isOpen}>
      <article>
        <main>
          <div style={{ margin: "10px" }}>
            {"Please grant permissions to use your local projects folder"}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "30px",
            }}
          >
            <button
              style={{ width: "100px" }}
              onClick={async () => {
                await requestPermission();
                loadFs();
                permissionPrompt.close();
              }}
            >
              Ok
            </button>
            <button
              style={{ width: "100px" }}
              onClick={() => {
                permissionPrompt.close();
              }}
            >
              Cancel
            </button>
          </div>
        </main>
      </article>
    </dialog>
  );

  const resetWarningDialog = (
    <dialog open={resetWarning.isOpen}>
      <article>
        <main>
          <div style={{ margin: "10px" }}>
            {
              'The "reset files" action will result in erasing all the HDL files kept in your browser\'s memory, replacing them with a fresh set of skeletal HDL files. You may want to back-up your files before resetting them. Are you sure that you want to reset the files?'
            }
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "30px",
            }}
          >
            <button
              style={{ width: "100px" }}
              onClick={async () => {
                await resetFiles();
                resetWarning.close();
                resetConfirm.open();
              }}
            >
              <Trans>Yes</Trans>
            </button>
            <button
              style={{ width: "100px" }}
              onClick={() => {
                resetWarning.close();
              }}
            >
              <Trans>Cancel</Trans>
            </button>
          </div>
        </main>
      </article>
    </dialog>
  );

  const resetConfirmDialog = (
    <dialog open={resetConfirm.isOpen}>
      <article>
        <header>
          <Trans>Your files were reset</Trans>
        </header>
        <main>
          <button onClick={resetConfirm.close}>
            <Trans>Ok</Trans>
          </button>
        </main>
      </article>
    </dialog>
  );

  return (
    <>
      <dialog open={settings.isOpen}>
        <article>
          <header>
            <p>
              <Trans>Settings</Trans>
            </p>
            <a
              className="close"
              href="#root"
              onClick={(e) => {
                e.preventDefault();
                settings.close();
              }}
            />
          </header>
          <main>
            <dl>
              <header>
                <Trans>Project</Trans>
              </header>
              <dt>
                <Trans>References</Trans>
              </dt>
              <dd>
                <div>
                  <a
                    href="https://nand2tetris.org"
                    target="_blank"
                    rel="noreferrer"
                  >
                    nand2tetris.org
                  </a>
                </div>
                <div>
                  <a
                    href="https://github.com/davidsouther/nand2tetris"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                </div>
              </dd>
              <dt>
                <Trans>NAND2Tetris Project Files</Trans>
              </dt>
              <dd>
                <button
                  disabled={upgrading}
                  onClick={async () => {
                    downloadProjectFiles();
                  }}
                  data-tooltip={
                    "This action will download to your device all the project files\n needed for completing the Nand to Tetris courses (both Part I and Part II). You will be prompted where to store the nand2tetris/projects folder on your device"
                  }
                  data-placement="bottom"
                >
                  <Trans>Download the projects folder</Trans>
                </button>
                <a
                  ref={downloadRef}
                  style={{ display: "none" }}
                  download="projects.zip"
                />
                {showUpgradeFs && canUpgradeFs && (
                  <>
                    <button
                      disabled={upgrading}
                      onClick={async () => {
                        upgradeFsAction();
                      }}
                      data-tooltip="Load a nand2tetris project folder stored on your device"
                      data-placement="bottom"
                    >
                      {localFsRoot ? (
                        <Trans>Select a different projects folder:</Trans>
                      ) : (
                        <Trans>Select a different projects folder:</Trans>
                      )}
                    </button>
                    {localFsRoot && (
                      <p>
                        <Trans>Current projects folder</Trans>
                        <code>{localFsRoot}</code>
                        <button
                          onClick={async () => {
                            await closeFs();
                          }}
                          data-tooltip={t`Close the locally opened projects folder, and instead store your files in the browser's local storage.`}
                          data-placement="bottom"
                        >
                          <Trans>Use browser storage</Trans>
                        </button>
                      </p>
                    )}
                  </>
                )}
                {!localFsRoot && (
                  <button
                    onClick={async () => {
                      resetWarning.open();
                    }}
                  >
                    <Trans>Reset</Trans>
                  </button>
                )}
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
                <label>
                  <input
                    type="checkbox"
                    name="switch"
                    role="switch"
                    checked={monaco.wants}
                    disabled={!monaco.canUse}
                    onChange={(e) => monaco.toggle(e.target.checked)}
                  />
                  <Trans>Use Monaco Editor</Trans>
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
              <dt>
                <Trans>Tracking</Trans>
              </dt>
              <dd>
                <label>
                  <input
                    type="checkbox"
                    name="switch"
                    role="switch"
                    checked={tracking.canTrack}
                    onChange={(e) => {
                      if (e.target.checked) {
                        tracking.accept();
                      } else {
                        tracking.reject();
                      }
                    }}
                  />
                  <Trans>Allow anonymous interaction tracking</Trans>
                  <TrackingDisclosure />
                </label>
              </dd>
            </dl>
          </main>
        </article>
      </dialog>
      {permissionPromptDialog}
      {resetWarningDialog}
      {resetConfirmDialog}
    </>
  );
};
