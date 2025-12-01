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

  const [storageMode, setStorageMode] = useState<"browser" | "pc">(
    localFsRoot ? "pc" : "browser",
  );
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (localFsRoot) {
      setStorageMode("pc");
    } else {
      setStorageMode("browser");
    }
  }, [localFsRoot]);

  const upgradeFsAction = async (createFiles?: boolean) => {
    setUpgrading(true);
    try {
      await upgradeFs(localFsRoot != undefined, createFiles);
      // If after upgrade attempt we still don't have a root (cancelled), revert to browser
      if (!localFsRoot) {
        // We can't check localFsRoot immediately here as it might depend on context update
        // But if the user cancelled, the context won't update to have a root.
        // We'll rely on the useEffect above to sync state if it DOES update.
        // If it doesn't update (cancel), we might need to manually revert if we set it to 'pc' optimistically?
        // Actually, we set 'pc' via radio click. If cancel happens, we want to go back to 'browser'.
        // Let's check if the operation was successful. upgradeFs usually throws or returns.
        // If we are here, it didn't throw.
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        // User cancelled
        setStorageMode("browser");
      } else {
        console.error("Failed to upgrade FS", { err });
        setStatus(t`Failed to load local file system.`);
        setStorageMode("browser");
      }
    } finally {
      setUpgrading(false);
      // If we finished and still don't have a root (e.g. cancelled without error if that's possible, or just didn't select),
      // we might want to ensure we are consistent.
      // However, since upgradeFs is async, we can't easily know the *result* state here immediately if it relies on context propagation.
      // But usually if it fails/cancels, we want to be in browser mode.
    }
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

  const closeWarning = useDialog();

  const handleClose = () => {
    if (storageMode === "pc" && !localFsRoot) {
      closeWarning.open();
    } else {
      settings.close();
    }
  };

  const closeWarningDialog = (
    <dialog open={closeWarning.isOpen}>
      <article>
        <header>
          <Trans>Incomplete Setup</Trans>
        </header>
        <main>
          <div style={{ margin: "10px" }}>
            <Trans>You chose use pc storage but didn't select the folder in your PC</Trans>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "30px",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            <button
              onClick={() => {
                closeWarning.close();
                // Optionally trigger the file picker here?
                // The user might just want to go back to the settings to click it themselves.
                // Let's just close the warning so they can click "Select Projects Folder".
              }}
            >
              <Trans>Select Folder</Trans>
            </button>
            <button
              className="secondary"
              onClick={() => {
                setStorageMode("browser");
                closeWarning.close();
                settings.close();
              }}
            >
              <Trans>Use Browser Storage</Trans>
            </button>
          </div>
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
                handleClose();
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
                        checked={storageMode === "browser"}
                        onChange={async () => {
                          setStorageMode("browser");
                          if (localFsRoot) {
                            await closeFs();
                          }
                        }}
                      />
                      <Trans>Use browser storage</Trans>
                    </label>
                  </div>

                  <div className="storage-option">
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <label style={{ width: "auto" }}>
                        <input
                          type="radio"
                          name="storage-mode"
                          checked={storageMode === "pc"}
                          onChange={() => {
                            setStorageMode("pc");
                            // Do NOT trigger upgradeFsAction here anymore
                          }}
                        />
                        <Trans>Use PC storage</Trans>
                      </label>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(
                            process.env.PUBLIC_URL + "/user_guide/fle_system.pdf",
                            "_blank",
                            "width=1000,height=800"
                          );
                        }}
                        style={{ fontSize: "0.9rem" }}
                      >
                        <Trans>File System User Guide</Trans>
                      </a>
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#888", marginLeft: "1.8rem", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
                      <Trans>Works on Chrome, Edge, Opera, and other Chromium-based browsers</Trans>
                    </div>
                    <div
                      className="folder-location-row"
                      style={{
                        opacity: storageMode === "pc" ? 1 : 0.5,
                        pointerEvents: storageMode === "pc" ? "auto" : "none",
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
                            disabled={upgrading}
                            onClick={async () => {
                              // Check if we are already in PC mode but no folder selected, or changing folder
                              // If we are in browser mode (shouldn't happen due to pointerEvents), switch to PC first?
                              // No, pointerEvents handles it.
                              try {
                                await upgradeFsAction();
                                // After action, check if we have a root.
                                // Note: localFsRoot might not be updated immediately in this closure.
                                // We rely on the catch block in upgradeFsAction to handle cancellation.
                              } catch (e) {
                                // Should be caught inside upgradeFsAction
                              }
                            }}
                            data-tooltip={t`Select the folder where the projects are stored on your PC`}
                            data-placement="bottom"
                            style={{ marginLeft: "auto" }}
                          >
                            {localFsRoot ? (
                              <Trans>Change folder</Trans>
                            ) : (
                              <Trans>Select Projects Folder</Trans>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Download Projects Folder */}
                    <div style={{
                      marginTop: "1rem",
                      marginLeft: "2rem",
                      opacity: storageMode === "pc" ? 1 : 0.5,
                      pointerEvents: storageMode === "pc" ? "auto" : "none",
                    }}>
                      <button
                        onClick={() => window.open("https://drive.google.com/open?id=1oD0WMJRq1UPEFEXWphKXR6paFwWpBS4o", "_blank")}
                        data-tooltip={t`Must be done (one time) if you want to use PC storage`}
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
                    nand2tetris.org (course website)
                  </a>
                </div>
                <div>
                  <a
                    href="https://github.com/davidsouther/nand2tetris"
                    target="_blank"
                    rel="noreferrer"
                  >
                    nand2tetris/web-IDE on Github (open source)
                  </a>
                </div>
              </dd>


            </dl>
          </main>
        </article>
      </dialog>
      {permissionPromptDialog}
      {resetWarningDialog}
      {resetConfirmDialog}
      {closeWarningDialog}
    </>
  );
};

