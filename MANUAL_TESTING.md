# Manual Testing

Contributor playbook for features that resist automation. Browser automation tools like Playwright cannot drive a real native directory picker, so the local desktop storage feature must be verified by hand before any PR that touches `components/src/stores/base.context.ts`, `components/src/stores/base/fs.ts`, `components/src/stores/base/indexDb.ts`, or `web/src/shell/settings.tsx` is merged.

Chromium (Chrome, Edge, Brave, Opera) is required. Firefox and Safari do not implement the File System Access API.

## Setup

1. `npm install && npm run build`
2. `npm run start`
3. Open the served URL in Chromium.
4. Create an empty scratch folder anywhere on disk. This will be the "PC projects folder" for the session. A fresh empty folder is important; the app seeds it the first time.

## Desktop Storage round-trip

The feature being exercised: switching storage mode from Browser to PC, seeding the folder, editing a chip, reloading the tab, and confirming the edit persisted through `IndexedDB → FileSystemDirectoryHandle → FileSystemAccessFileSystemAdapter → chip store → editor`.

1. Open the gear icon (Settings) in the header.
2. Under **Projects File Storage**, select **Use Desktop Storage**.
3. Click **Select Projects Folder** and pick the empty scratch folder created above. Grant read/write permission when the browser prompts.
4. Confirm the folder path now renders next to **Projects folder location**. Close Settings.
5. In a file browser (Finder/Explorer), confirm the folder now contains `01/`, `02/`, … through `08/` with the expected assignment files.
6. In the IDE, select **Project 1** / chip **And**. The HDL editor should display the And template (`CHIP And { … }` with `//// Replace this comment with your code.`).
7. Add a recognisable marker line inside `PARTS:`, e.g. `// manual-test-marker`. The editor autosaves on change; no Save button.
8. Open `01/And.hdl` in your OS text editor. Confirm the marker is present on disk.
9. Reload the browser tab (Cmd/Ctrl+R).
10. Depending on the browser, you may see a permission prompt to re-grant access. Accept it.
11. The IDE should reopen on the chip page; reselect Project 1 / And if needed. Confirm the marker from step 7 is still in the editor.
12. Remove the marker, let autosave flush, reload once more, and confirm the edit is gone on both disk and in the editor.

Pass criteria: every step above behaves as described, no console errors, and the on-disk file contents stay in lockstep with the editor across the reload boundary.

## Teardown

1. Settings → **Use browser storage** to revert.
2. Delete the scratch folder if you no longer need it.
3. If the app gets wedged on a stale IndexedDB handle, clear site data from Chromium DevTools → Application → Storage → Clear site data.

## When to run

- Any PR that touches the files listed in the opening paragraph.
- Before cutting a release.
- After upgrading Chromium or the File System Access API surface the app uses.

## Why this is manual

The native directory picker (`window.showDirectoryPicker`) requires a user gesture and returns handles that Playwright cannot mint from outside the page. A Node-side fixture that forges File System Access handles inside the page has been prototyped but is not yet production quality. See `docs/developer/2026-04-22-D-local-storage-e2e/` for the design exploration and why it was set aside.
