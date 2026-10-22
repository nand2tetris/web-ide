# Open Bug backlog: working theories and repros

Snapshot 2026-10-22, issue type `Bug`, nand2tetris/web-ide, base `dcbf864`.
Status: **R** = reproduced by a committed test, **T** = theory from code review only, **X** = does not reproduce on main / out of this repo.

Repro tests that fail today are wrapped so the suites stay green:
Vitest uses `test.fails` (remove `.fails` with the fix); Playwright specs are tagged `@bug`
and skipped unless run with `BUGS=1 npm test -w e2e -- --grep @bug`.
Each was run un-wrapped once to confirm it fails for the stated reason.

| # | Title | Status | Repro |
|---|-------|--------|-------|
| 694 | Service worker build in Vite | R | `e2e/tests/bugs/issue-694-service-worker.spec.ts` |
| 682 | Failed to fetch `Monaco-*.js` | T (same cause as 694) | covered by 694 |
| 673 | VM Emulator: "No .vm files", blank page | R (two defects) | `components/src/repro/issue-673.test.ts` |
| 622 | Run clears program / "Cannot find /Mult.asm" (+#527) | R | `components/src/repro/issue-622.test.ts` |
| 602 | Assembler cannot load a local file | Fixed (branch `claude/602-file-load`); repro now passes, drop `@bug` tag on merge | `e2e/tests/bugs/issue-602-asm-local-file.spec.ts` |
| 661 | Cannot exit Monaco find mode | R (styling), click not reproduced | `e2e/tests/bugs/issue-661-find-widget.spec.ts` |
| 561 | Memory test hangs in Chrome | X (fixed in tree; stale download) | none |
| 488 | OutputTest ERR 14 / stack overflow | X | `simulator/src/repro/issue-488.test.ts` (passes, regression guard) |
| 659 | Wrong RAM addresses in tests | X (needs reporter's version) | none |
| 668 | MathTest step limit | X (file not in this repo) | none |
| 665 | Copy/paste on Safari iPadOS | T, unverified | none |
| 545 | ResizeObserver overlay on dev server | T, likely obsolete | none |
| 445 | Jack compiler tooltip, Firefox | T, likely fixed | none |

## Findings

### #694 and #682: service worker is never emitted by Vite
- `web/src/index.tsx:18` calls `serviceWorkerRegistration.register()`, which registers `${BASE_URL}service-worker.js`.
- `web/src/service-worker.ts` is a CRA Workbox file (`self.__WB_MANIFEST`). `web/vite.config.ts` has no entry or plugin for it.
- `npm run build -w web` output (checked) has no `service-worker.js`. GitHub Pages answers 404.
- #682: chunk names are content-hashed (`Monaco-CQMKx7kc.js` here, `Monaco-CxvvpQgB.js` in the report).
  A stale `index.html` or an old CRA-era worker still precaching old assets points at a chunk that no longer exists.
  #488 ("works locally, fails on the site") fits the same pattern.
- Fix direction: build the worker with `vite-plugin-pwa` (injectManifest) or drop it and unregister old workers;
  add a `vite:preloadError` handler that reloads once.

### #622 and #673: local uploads are never written to the virtual fs
- `web/src/shell/test_panel.tsx` (the `File uploaded` branch) calls `setPath(tstFile.name)`: a basename, no directory.
- Test `load` resolves against `dirname(path)`, so a CPU script's `load Mult.asm` reads `/Mult.asm`
  (`cpu.store.ts` doLoad): "Cannot find /Mult.asm", exactly as commented on #622.
- VM: a bare `load,` calls `vm.store.ts load("")`, which finds no `.vm` files: "No .vm files to load".
  The user's locally uploaded VMs are already in the store but are discarded.
- Safari and Firefox lack the File System Access API, so upload is their only path. Chrome with a local FS root is unaffected.
- Second defect (#673 blank page): `fs.stat` on a missing path rejects with `undefined`.
  `vm.store.ts` `load()` calls it, and `testStep`'s catch does `(e as Error).message`, which throws a TypeError out of the catch.
  The Timer's promise rejects unhandled and the run dies. The same unsafe cast is at `vm.store.ts:423`, `cpu.store.ts:202`,
  `chip.store.ts:579` and `chips/memory.tsx:263`.
- Fix direction: write uploads into `fs` (for example under an `/uploads` dir) and use that as the test dir,
  or have `load` fall back to the files already loaded; make the catch blocks coerce non-Errors.

### #602: Assembler picker has no local option (fixed)
- Cause: `web/src/pages/asm.tsx` opened the picker with `filePicker.select`; CPU, VM and the test panel use `selectAllowLocal`,
  which is what shows "Select local file". `loadAsm` also assumed a `Path`.
- Fix: `web/src/shell/file_selection.ts` adds `readSelection` / `readFirstSelection`, which turn any picker result
  (`Path` file, `Path` folder, `LocalFile`, `LocalFile[]`) into `{name, path?, content}[]`, reading from `fs` only when needed.
  The Assembler (load and compare), CPU `loadFile`, VM `load` and the test panel's local-upload branch use it.
  New store action `loadLocalAsm` (`components/src/stores/asm.store.ts`) loads uploaded source with no path,
  so it is never written over the previously loaded file.
- Not touched on purpose: #622/#673. Uploads are still not written to `fs`; `PickedFile.path` is absent for them,
  which is the hook a later fix can use (write the file, then fill `path`).
- Still open from the report: "no option to create a new file" is a feature request.

### #661: Pico restyles Monaco's find widget
- Probe on `/chip` (Chromium, Vite dev): the widget's `div[role=button]` buttons get Pico's `[role=button]` rule:
  background `rgb(16, 149, 193)`, 1px border, 3px padding.
- The "x" still closes on click in Chromium, so the reported failure is not reproduced.
  The reporter's browser is unknown, and the maintainer reproduced it on 2026-06-12. Ask for browser and version.
- Fix direction: scope Pico's button rules away from `.monaco-editor` (or reset `.monaco-editor [role=button]`).

### Not reproduced / outside this repo
- **#561**: `projects/src/project_05/01_memory.ts:161,214` already use `tick, tock;`.
  The hang comes from the downloaded project zip, which still has commas (comment by Timzka, 2026-06-23).
  `#690` (yield during long `Test.step()`) may also soften it. Action: update the zip; close.
- **#488**: the report's `Main.jack` runs to exit code 0 on main. Reports are from Oct and Dec 2024 on the deployed site; likely the stale-build problem above.
- **#659**: `projects/src/project_08/23_statics_test.ts` and `22_fibonacci_element.ts` list `RAM[0] RAM[261] RAM[262]` and `RAM[0] RAM[261]`,
  matching the `.cmp` files and the official course files. Need the reporter's screenshot source or build.
- **#668**: no `MathTest` in `projects/src` (only projects 01–08 live here). The step limit and the project 11 wording belong to the external projects bundle.
- **#665**: no clipboard code in `web/src` or `components/src`; copy/paste in the editor is Monaco's. Needs iPadOS Safari to verify.
- **#545**: the trace shows CRA's `bundle.js` on `:3000`. The app is on Vite now, so this overlay no longer exists. Candidate to close.
- **#445**: fixed by the merged #419 (per the issue's linked PR). Candidate to close.
