# Open Bug backlog: working theories and repros

Snapshot 2026-10-22, issue type `Bug`, nand2tetris/web-ide, base `dcbf864`.
Status: **F** = fixed on branch `claude/694-service-worker` (test no longer gated), **R** = reproduced by a committed test, **T** = theory from code review only, **X** = does not reproduce on main / out of this repo.

Repro tests that fail today are wrapped so the suites stay green (the #622 and #673 repros are now unwrapped and pass):
Vitest uses `test.fails` (remove `.fails` with the fix); Playwright specs are tagged `@bug`
and skipped unless run with `BUGS=1 npm test -w e2e -- --grep @bug`.
Each was run un-wrapped once to confirm it fails for the stated reason.

| # | Title | Status | Repro |
|---|-------|--------|-------|
| 694 | Service worker build in Vite | F (fixed: worker removed, kill-switch served) | `e2e/tests/bugs/issue-694-service-worker.spec.ts` (now in the default suite) |
| 682 | Failed to fetch `Monaco-*.js` | F (fixed with 694: `vite:preloadError` reload-once) | covered by 694 |
| 673 | VM Emulator: "No .vm files", blank page | R, store side fixed (UI follow-up below) | `components/src/repro/issue-673.test.ts` |
| 622 | Run clears program / "Cannot find /Mult.asm" (+#527) | R, store side fixed (UI follow-up below) | `components/src/repro/issue-622.test.ts` |
| 602 | Assembler cannot load a local file | Fixed; repro now runs in the default e2e suite | `e2e/tests/asm/local-file.spec.ts` |
| 661 | Cannot exit Monaco find mode | R (styling), click not reproduced | `e2e/tests/bugs/issue-661-find-widget.spec.ts` |
| 561 | Memory test hangs in Chrome | X (fixed in tree; stale download) | none |
| 488 | OutputTest ERR 14 / stack overflow | X | `simulator/src/repro/issue-488.test.ts` (passes, regression guard) |
| 659 | Wrong RAM addresses in tests | X (needs reporter's version) | none |
| 668 | MathTest step limit | X (file not in this repo) | none |
| 665 | Copy/paste on Safari iPadOS | T, unverified | none |
| 545 | ResizeObserver overlay on dev server | T, likely obsolete | none |
| 445 | Jack compiler tooltip, Firefox | T, likely fixed | none |

## Findings

### #694 and #682: service worker is never emitted by Vite (fixed)
- Root cause: `web/src/index.tsx:18` registered `${BASE_URL}service-worker.js`, but `web/vite.config.ts` never built `web/src/service-worker.ts` (a CRA Workbox file), so GitHub Pages answered 404.
  Worse, a 404 at the registered URL makes the browser's update check fail, so CRA-era installs kept their old worker and its stale precache and index.html forever.
  Stale `index.html` plus old hashed chunk names is #682 ("Failed to fetch dynamically imported module .../Monaco-*.js"); #488 fits the same pattern.
- Fix (option b, no new dependency): the app registers nothing. `web/public/service-worker.js` is a kill-switch served at the old URL
  (skipWaiting, delete Workbox caches containing `/web-ide/` plus CRA's `images`, unregister, reload in-scope tabs).
  `web/src/legacyServiceWorker.ts` does the same cleanup from the page. `web/src/preloadError.ts` reloads once on `vite:preloadError`
  (sessionStorage guard, cleared after 10 s of uptime, no storage means no reload). `service-worker.ts` and the CRA registration helper are deleted.
- Why not `vite-plugin-pwa`: it is not installed, Vite is 8.0.10 here (`web/package.json` asks ^7.3.2), it needs a precache and update policy,
  and it reintroduces the stale-chunk hazard. The offline benefit was already gone: the editor loads from jsdelivr at runtime.
- The old worker's CDN entries were dead: it precached `monaco-editor@0.43.0` and Material Symbols `v179`;
  the page requests `monaco-editor@0.55.1` (from `@monaco-editor/loader` 1.7.0 defaults) and `v380`. Its `/web-ide/...` absolute paths happened to match the base.
- Follow-up, not done: `monaco-editor` is bundled (`Monaco-*.js`, 3.7 MB, via `web/src/languages/jack.ts:1` and `web/src/shell/Monaco.tsx:4`)
  and also fetched from jsdelivr, because no `loader.config({ monaco })` exists. Offline support would need that first.
- Keep `public/service-worker.js` indefinitely: old installs can return at any time.
- Test: `e2e/tests/bugs/issue-694-service-worker.spec.ts` serves a fake old CRA site, lets its worker take control, swaps in the new build,
  and expects the worker and cache gone and the new app loaded; then blocks the first `Monaco-*.js` request and expects one reload and a working editor.
  It skips when `web/build` is missing (CI builds first) and honours `BUILD_DIR`. Checked red against the pre-fix build and red with the listener disabled.

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

#### #622 and #673: store-side fix (done) and UI follow-up (open)
Done in `components/src` only:
- `errorMessage(e: unknown)` in `file_utils.ts` replaces every `(e as Error).message` in `vm.store.ts`, `cpu.store.ts`, `chip.store.ts` and `chips/memory.tsx`.
  A rejection with `undefined` no longer throws out of the catch.
- `vm.store.ts` `load()` wraps `fs.stat` in try/catch. Missing path: bare `load,` (path `""`) keeps the VM files from the last `loadVm` and only resets;
  an explicit missing path throws `Cannot find <path>`, reported as `Runtime error: ...`. An empty folder with a bare `load,` also keeps the loaded files.
- `cpu.store.ts` `compileTest` `doLoad`: if `fs.readFile` fails and the test path has no `/` (bare upload) and the ROM is non-empty, keep the ROM.
  A test with a real directory, or an empty ROM, still gets `Cannot find <path>`.
- These are fallbacks, not the real fix: they only work when the program was uploaded before the test.

Still open, for after the #602 shared file-picking abstraction lands (`web/src/shell/file_select.tsx`, `test_panel.tsx`, page pickers):
- Write `LocalFile` uploads (program, VM folder, tst, cmp) into the virtual `fs`, for example under `/uploads/<name>/`.
- `test_panel.tsx` upload branch should call `setPath` with that fs path, not `tstFile.name`, so `dirname` is real and `load Foo.asm`, `compare-to` and `load,` resolve normally.
  Then the bare-path fallbacks above become a safety net.
- With uploads in `fs`, a test that `load`s a different file than the one uploaded works; today it fails with `Cannot find`.
- Check the `compareTo` handlers in `cpu.store.ts` and `vm.store.ts`: they `fs.readFile` next to the tst and still fail for bare paths.
- The #673 "blank page" was the unhandled TypeError; confirm in a browser (Safari/Firefox) that the error banner now shows.

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
