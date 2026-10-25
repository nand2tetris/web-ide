# Agent Instructions

These rules apply to every coding agent working in this repository. [DEVELOPMENT.md](./DEVELOPMENT.md) holds the full developer guide; read it when a task needs more detail than this file gives.

## Repository

This repository is a TypeScript monorepo of npm workspaces that implements the nand2tetris course as a browser IDE. Run every command from the repository root.

| Path | Contents |
|------|----------|
| `projects/` | Course files (HDL, ASM, VM, Jack, tests) exported as TypeScript strings |
| `runner/` | Bridge to the reference Java tools for conformance testing |
| `simulator/` | Emulation engine: chips, CPU, VM, assembler, compiler, test scripts |
| `components/` | Shared React components and state stores |
| `web/` | Vite single page app that hosts every tool |
| `cli/` | `nand2tetris` grading CLI |
| `extension/` | VS Code extension |
| `e2e/` | Playwright end to end tests for `web` |

Packages build in this order, because each package imports a previous package's `build/` output:

```
projects → runner → simulator → components → web
```

## Commands

- Format with `npm run format`. Apply lint fixes with `npm run fix`.
- Check format, types, and lint with `npm run check`.
- Run unit tests with `npm test`, or `npm test -w <package>` for one package.
- Run end to end tests with `npm run test:e2e`.
- Do not invoke `biome`, `tsc`, or `vitest` directly to format, lint, type check, or test. Use the scripts in `package.json`.
- `npm run check` and `npm test` build every package first, so they are slow. While iterating, prefer a TypeScript language server for type errors, and run `npm test -w <package>` for the package you changed.

## Done criteria

A task is complete only when both of these exit 0:

1. `npm run check`
2. `npm test`

Changes to the chip simulator UI must also pass `npm run test:e2e`. Changes to desktop storage must also pass the manual checks in [MANUAL_TESTING.md](./MANUAL_TESTING.md).

## Conventions

- Put tests beside their source as `*.test.ts` or `*.test.tsx` inside `src/`. Unit tests use Vitest.
- In `simulator`, return `Result<T, E>` from `@davidsouther/jiffies` instead of throwing exceptions.
- Define domain languages (HDL, ASM, VM, Jack, TST, CMP) with Ohm grammars in `simulator`.
- Keep stores in `components/src/stores` free of UI imports so `web` and `extension` can share them. Stores use `useImmerReducer`.
- Wrap user facing text in `web` with Lingui's `<Trans>` or `` t`...` `` macros, and never assign message IDs. [DEVELOPMENT.md](./DEVELOPMENT.md#internationalization) explains the catalogs and translations.
- Drive simulation timing through the `Clock` singleton (`Clock.get()`), and subscribe to it inside `useEffect`.

## Do not

- Do not edit files under any `build/` directory. Change the source and rebuild.
- Do not add a separate `tests/` directory for unit tests.
- Do not add a second formatter, linter, or test runner.
