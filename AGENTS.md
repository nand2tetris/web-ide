# Agent Instructions

@DEVELOPMENT.md

[DEVELOPMENT.md](./DEVELOPMENT.md) is the developer guide for this repository. Read it first if your tool does not expand the import above. The rules below apply only to coding agents.

- Format, lint, type check, and test only through the `npm run` and `npm test` scripts. Do not invoke `biome`, `tsc`, or `vitest` directly.
- While iterating, use a TypeScript language server for type errors instead of the slow `npm run check`, and run `npm test -w <package>` for the package you changed.
- Do not edit files under any `build/` directory. Change the source and rebuild.
- Do not claim a task is complete until the [validation gates](./DEVELOPMENT.md#validation-gates) pass.
