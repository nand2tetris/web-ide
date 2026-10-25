# Nand2Tetris Web IDE Developer Guide

This guide explains how the repository is built, tested, and organized. [CONTRIBUTING.md](./CONTRIBUTING.md) covers first time setup and the pull request process. [AGENTS.md](./AGENTS.md) condenses these rules for coding agents. [MANUAL_TESTING.md](./MANUAL_TESTING.md) lists checks that cannot be automated.

## Project Summary

The repository is a TypeScript monorepo of npm workspaces. It implements the full nand2tetris course, from hardware simulation through the operating system, as a browser IDE. GitHub Pages hosts the deployed app at <https://nand2tetris.github.io/web-ide>.

## Toolchain

| Tool | Version | Purpose |
|------|---------|---------|
| Node | 22 or newer | Runtime |
| npm | 10 or newer | Package manager and workspaces |
| TypeScript | ^6.0 | Language, with composite project references |
| Biome | ^2.4 | Formatter and linter |
| Vite | ^7 | Dev server and bundler for `web` |
| Vitest | ^4 | Unit tests for `simulator`, `components`, `web`, and `cli` |
| Playwright | ^1.52 | End to end tests for `web`, Chromium only |

## Package Roles

| Package | Role |
|---------|------|
| `projects/` | Static data: all HDL, ASM, VM, and Jack course files as TypeScript string exports |
| `runner/` | Bridge to the reference Java implementation for conformance testing |
| `simulator/` | Core emulation engine: chip, CPU, VM, assembler, compiler, and test runner |
| `components/` | Shared React components and Immer and RxJS state stores |
| `web/` | Vite single page app hosting all tools; deploys to GitHub Pages |
| `cli/` | `nand2tetris` grading CLI |
| `extension/` | VS Code extension wrapping the same components |
| `e2e/` | Playwright end to end tests for the web app |

## Package Build Order

Each package imports a previous package's `build/` output, so packages build in this order:

```
projects → runner → simulator → components → web
```

`cli` depends on `runner` and `simulator`. `extension` depends on `simulator` and `components`. Neither is part of the default test run.

## Key Commands

Run these from the repository root.

| Command | What it does |
|---------|-------------|
| `npm run check` | Builds the libraries, then checks format, types, and lint |
| `npm run format` | Formats TypeScript sources with Biome and writes the result |
| `npm run fix` | Applies automated Biome lint fixes |
| `npm test` | Runs `npm run build` (which runs `npm run check`), then Vitest in `simulator`, `components`, and `web` |
| `npm test -w <package>` | Runs Vitest in one package without rebuilding its dependencies |
| `npm run build` | Runs `npm run check`, then builds every package in order |
| `npm run watch` | Rebuilds `projects`, `runner`, `simulator`, and `components` on change |
| `npm run start` | Starts the Vite dev server for `web` at <http://localhost:5173/web-ide/> |
| `npm run test:e2e` | Runs the Playwright end to end tests (see below) |

Use only these scripts to format, lint, or type check. Formatting and linting are fast, so run them after every change.

`npm run check` builds `projects`, `runner`, `simulator`, and `components` before it type checks, because packages reference each other's `build/` output. The build makes the check slow, so a TypeScript language server in an editor gives faster feedback while iterating.

Unit test files live in `src/` beside their source as `*.test.ts` or `*.test.tsx`, not in a separate `tests/` directory.

## Architecture Notes

- The simulator uses `Result<T, E>` from `@davidsouther/jiffies` instead of exceptions.
- An RxJS `Clock` singleton drives tick and tock. React components subscribe to it in `useEffect`.
- Ohm.js grammars define all domain languages: HDL, ASM, VM, Jack, TST, and CMP.
- State stores use `useImmerReducer`. Stores have no UI imports, so `web` and `extension` share them.

[README.md](./README.md#architecture) describes each subsystem in more depth.

## Internationalization

`web` translates its interface with [Lingui](https://lingui.dev) 5. The Lingui configuration is the `lingui` key in `web/package.json`. `components`, `simulator`, and `extension` do not use Lingui, so their strings are not translatable. `components/src/i18n.tsx` is an unused stub.

### Adding a string

- Wrap JSX text in `<Trans>` from `@lingui/react/macro`.
- Wrap strings in attributes, props, and code in the `` t`...` `` macro from `@lingui/core/macro`.
- Do not nest the two. `` <Trans>{t`Choose file`}</Trans> `` copies the whole source file into the catalog as a placeholder comment. Use `<Trans>Choose file</Trans>` instead.
- Do not assign message IDs. The SWC plugin (`useLinguiV5IdGeneration` in `web/vite.config.ts`) derives each ID from the source text, which serves as the English message.
- Do not hardcode user facing text, such as the "Select local file" button in `web/src/shell/file_select.tsx`.

### Building the catalogs

| Script | Input | Output |
|--------|-------|--------|
| `npm run extract -w web` | Macros in `web/src` and `web/public` | `web/src/locales/<locale>/messages.po` |
| `npm run lingui -w web` | The `.po` catalogs | `web/src/locales/<locale>/messages.mjs` |

`web/src/.gitignore` ignores `web/src/locales/`, so neither output is committed. Both scripts run automatically before `npm run check` and before `npm run build -w web`, so `npm test` and CI regenerate the catalogs on every run. Rerun them yourself before `npm run start` or `npm test -w web` in a fresh clone, because `web/src/App.tsx` and `web/src/setupTests.ts` import the compiled `.mjs` files. No check fails on missing translations.

### Translations

The configured locales are `en`, which is the source locale, and `en-PL`, which is a pseudolocale. `lingui compile` generates accented `en-PL` text automatically, which helps find strings that are not wrapped. No human translations exist yet. Because git ignores `web/src/locales/`, a translated `.po` file cannot be committed. Contributing a translation first requires changing `web/src/.gitignore` so that the locale's `messages.po` is tracked.

To add a locale today:

1. Add it to `lingui.locales` in `web/package.json`. Optionally map it in `lingui.fallbackLocales`.
2. Run `npm run extract -w web`, then translate the `msgstr` entries in its `messages.po`.
3. Import its `messages.mjs` in `web/src/locales.ts`, and register it with `i18n.load` and `i18n.loadLocaleData` in `web/src/App.tsx`.
4. Run `npm run lingui -w web` and `npm run start`, and check the pages in that locale.

At startup, `web/src/App.tsx` activates `navigator.language`. In browser storage mode, `web/src/shell/settings.tsx` then activates the locale stored in the browser file `/locale`, and writes `en` there when the file is missing. The app has no language picker. `lingui compile` fills a missing translation from the fallback locale or the source text.

## End to End Tests

End to end tests live in `e2e/tests/` and run with Playwright against the dev server at <http://localhost:5173/web-ide/>.

| Command | What it does |
|---------|-------------|
| `npm run test:e2e` | Runs every test in CI mode: always starts a fresh dev server and retries failures |
| `npm run test:e2e:smoke` | Runs only the tests tagged `@smoke`, in CI mode |
| `npm test -w e2e` | Runs every test locally, reusing a dev server started with `npm run start` |
| `npm test -w e2e -- --headed` | Runs with a visible browser window |
| `npm test -w e2e -- --ui` | Opens Playwright UI mode for interactive debugging |
| `npm test -w e2e -- --debug` | Runs with the Playwright inspector attached |
| `npm run -w e2e flakes` | Repeats each test 10 times to identify flaky tests |

Append `-- --grep "<pattern>"` to any of these commands to limit which tests run.

In CI mode, Playwright records a trace when it retries a failed test. View the trace with:

```
npx playwright show-trace e2e/test-results/<test-name>/trace.zip
```

Install the Playwright browser once after cloning, and again after upgrading Playwright:

```
npm run playwright:install
```

## Validation Gates

A change is ready for review when both of these commands exit 0:

- `npm run check` reports no format, type, or lint errors.
- `npm test` passes every Vitest suite.

End to end tests are not required for every change, but they must pass before merging a feature that touches the chip simulator UI. A change to desktop storage also requires the manual checks in [MANUAL_TESTING.md](./MANUAL_TESTING.md).
