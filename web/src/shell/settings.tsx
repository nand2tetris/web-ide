import { i18n } from "@lingui/core";
import { Trans, t } from "@lingui/macro";
import { BaseContext } from "@nand2tetris/components/stores/base.context.js";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../App.context";

import { useDialog } from "@nand2tetris/components/dialog";
import { PageContext } from "src/Page.context";
import "../pico/button-group.scss";
import "../pico/property.scss";
import "./settings.scss";
import { TrackingDisclosure } from "../tracking";
import { getVersion, setVersion } from "../versions";

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
        <article className="settings-dialog">
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

              {/* Storage Mode Selection */}
              <dt>
                <Trans>
                  Project files
                </Trans>
              </dt>
              <dd>
                <div className="storage-mode-selection">
                  <div className="storage-option">
                    <label>
                      <input
                        type="radio"
                        name="storage-mode"
                        checked={!localFsRoot}
                        onChange={async () => {
                          if (localFsRoot) {
                            await closeFs();
                          }
                        }}
                      />
                      <Trans>Use browser storage</Trans>
                    </label>
                  </div>

                  <div className="storage-option">
                    <label>
                      <input
                        type="radio"
                        name="storage-mode"
                        checked={!!localFsRoot}
                        onChange={() => {
                          if (!localFsRoot && canUpgradeFs) {
                            upgradeFsAction();
                          }
                        }}
                      />
                      <Trans>Use PC storage</Trans>
                    </label>
                    <div style={{ fontSize: "0.85rem", color: "#888", marginLeft: "1.8rem", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
                      <Trans>Works on Chrome, Edge, Opera, and other Chromium-based browsers</Trans>
                    </div>
                    <div
                      className="folder-location-row"
                      style={{
                        opacity: localFsRoot ? 1 : 0.5,
                        marginLeft: "2rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <span>
                          <Trans>Projects folder location (on your PC)</Trans>:
                        </span>
                        {localFsRoot ? (
                          <code style={{ flex: "1", minWidth: "200px" }}>{localFsRoot}</code>
                        ) : (
                          <span style={{ flex: "1", minWidth: "200px", fontStyle: "italic" }}>
                            <Trans>Not selected</Trans>
                          </span>
                        )}
                        {showUpgradeFs && canUpgradeFs && (
                          <button
                            disabled={upgrading || !localFsRoot}
                            onClick={async () => {
                              upgradeFsAction();
                            }}
                            data-tooltip={t`Select a different projects folder stored on your PC`}
                            data-placement="bottom"
                            style={{ marginLeft: "auto" }}
                          >
                            {localFsRoot ? (
                              <Trans>Change folder</Trans>
                            ) : (
                              <Trans>Select folder</Trans>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Download Projects Folder */}
                    <div style={{ marginTop: "1rem", marginLeft: "2rem" }}>
                      <button
                        onClick={() => window.open("https://drive.google.com/open?id=1oD0WMJRq1UPEFEXWphKXR6paFwWpBS4o", "_blank")}
                        data-tooltip={t` Must be done (one-time) before selecting "use PC Storage"`}
                        data-placement="bottom"
                        style={{ width: "100%" }}
                      >
                        <Trans>Download the projects folder</Trans>
                      </button>
                    </div>
                  </div>
                </div>
              </dd>

              {/* Editor Section */}
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

              {/* Theme Section */}
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

              {/* Divider for bottom section */}
              <div style={{ borderTop: "1px solid var(--contrast-lower)", margin: "0.5rem 0 1rem 0" }} />

              {/* Bottom Section - Utility Items */}
              {!localFsRoot && (
                <>
                  <dt>
                    <Trans>Browser Storage Reset</Trans>
                  </dt>
                  <dd>
                    <button
                      onClick={async () => {
                        resetWarning.open();
                      }}
                    >
                      <Trans>Reset browser storage files</Trans>
                    </button>
                  </dd>
                </>
              )}



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
