# Nand2Tetris Web IDE — Developing

## Project Summary

TypeScript npm workspaces monorepo implementing the full nand2tetris course (hardware simulation through OS) as a browser-based IDE. Deployed to GitHub Pages at `https://nand2tetris.github.io/web-ide`.

## Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| Node | ≥25 | Runtime |
| npm | ≥10 | Package manager + workspaces |
| TypeScript | ^5.9 | Language (composite project references) |
| Biome | ^2.3 | Format + lint |
| Jest | ^29 | Tests (simulator, components use react-scripts) |
| Playwright | ^1.52 | E2E tests (chip simulator, Chromium only) |

## Package Build Order

Dependencies flow strictly left-to-right; always build in this sequence:

```
projects → runner → simulator → components → web
```

`cli`, `runner`, and `extension` are independent and excluded from most workflows.

## Key Commands (run from repo root)

| Command | What it does |
|---------|-------------|
| `npm run check` | format check + type check (builds all packages first) + lint |
| `npm run format` | Formats and writes all tracked TS files |
| `npm run fix` | Applies automated lint fixes. |
| `npm test` | builds all packages then runs Jest across simulator + components + web |
| `npm run test:e2e` | runs Playwright E2E tests (starts dev server automatically) |
| `npm run build` | full production build of all packages in order |
| `npm run start` | starts the CRA dev server for `web` |
| `npm run all` | install + check + test + build |

Only use the `npm run` commands to invoke formatter, linter, or type checking.

Linting and formatting run quickly. Run them after any change (formatting enforced for Claude via hooks).

`npm run check` runs `precheck:types` which builds all packages before type-checking. This is required because packages reference each other's `build/` output. Because it is slow, prefer `typescript-lsp` for checking for errors.

Test files live in `src/` alongside source (`.test.ts` / `.test.tsx`), not in a separate `tests/` directory. Run tests with `npm test` or `npm test -w <project>`.

## Package Roles

| Package | Role |
|---------|------|
| `projects/` | Static data: all HDL/ASM/VM/Jack course files as TS string exports |
| `simulator/` | Core emulation engine: chip, CPU, VM, assembler, compiler, test runner |
| `components/` | Shared React components and Immer/RxJS state stores |
| `web/` | CRA single-page app hosting all tools; deploys to GitHub Pages |
| `runner/` | Bridge to reference Java implementations for conformance testing |
| `cli/` | `npx nand2tetris grade` grading CLI |
| `extension/` | VS Code extension wrapping the same components |
| `e2e/` | Playwright E2E tests for the web app |

## Architecture Notes

- `Result<T, E>` from `@davidsouther/jiffies` is used instead of exceptions throughout simulator.
- RxJS `Clock` singleton drives tick/tock; React components subscribe in `useEffect`.
- Ohm.js grammars define all domain languages (HDL, ASM, VM, Jack, TST, CMP).
- State stores use `useImmerReducer`; stores have no UI imports so web and extension share them.

## E2E Tests

E2E tests live in `e2e/` and run with Playwright.

**Running from the repo root:**

| Command | What it does |
|---------|-------------|
| `npm run test:e2e` | Starts the dev server if needed, then runs all E2E tests |
| `npm test -w e2e -- --headed` | Run with a visible browser window |
| `npm test -w e2e -- --ui` | Open Playwright UI mode for interactive debugging |
| `npm test -w e2e -- --debug` | Run with Playwright inspector attached |
| `npm run -w e2e flakes` | Repeat each test 10 times to idenfity flakes.

Pass `-- --grep "Tests"` to any of these to limit which tests are executed.

When `npm run start` is already running, `npm run test:e2e` reuses the existing server (faster). In CI (`CI=true`), it always starts a fresh server.

**After a failure**, Playwright writes a trace to `e2e/test-results/*/trace.zip`. View it with:

```
npx playwright show-trace e2e/test-results/<test-name>/trace.zip
```

**Installing Playwright browsers** (once, after cloning or upgrading Playwright):

```
npm run playwright:install
```

## CI / Validation Gates

A clean state means:
- `npm run check` exits 0 — no format errors, no type errors, no lint errors
- `npm test` exits 0 — all Jest suites pass

Both must be true before claiming any task complete. E2E tests (`npm run test:e2e`) are not required for every change but must pass before merging features that touch the chip simulator UI.
