# Jack Evaluation (CLI)

This document explains how the CLI compiles Jack sources and evaluates VM tests, mirroring the behavior used by the web IDE while keeping everything on the command line.

## Overview

- You invoke the CLI with a test script: `nand2tetris run <path/to/TestVME.tst>`.
- The CLI detects VM/Jack tests by the presence of `vmstep` in the `.tst` file. If present, it runs the VM test pipeline; otherwise it falls back to the chip/CPU pipeline.
- For VM tests, the CLI:
  1) Parses the test (`.tst`).
  2) Loads/compiles the VM program (.vm files and/or compiles sibling .jack files).
  3) Executes the test using the simulator’s VM test harness.
  4) Compares the in-memory output log with the `.cmp` file referenced by the test’s `compare-to` directive.

There is no on-disk output unless the `.tst` itself contains `output-file ...;` commands; the pass/fail verdict is a pure string comparison between the test’s log and the `.cmp` contents.

## Entry Points

- CLI command selection and dispatch
  - `cli/src/index.ts:40` — `run <file>` resolves the argument and forwards tests to the runner.
  - `cli/src/testrunner.ts:70` — `testRunner(filePath)` loads the `.tst` text and decides which pipeline to use:
    - VM/Jack pipeline (contains `vmstep`) → `runVmTest(...)`.
    - Chip/CPU pipeline → existing `runner(fs)` path.

## VM/Jack Pipeline

The VM path relies on the same simulator APIs the web IDE uses.

1) Parse the test script
   - `TST.parse(...)` builds the test AST used to schedule `vmstep`, `output-list`, `compare-to`, etc.
   - Reference: `simulator/src/languages/tst.ts:1`.

2) Build the VM from sources
   - Collect sources from the test’s directory:
     - If any `.jack` files exist, compile them to in-memory `.vm` strings using the Jack compiler:
       - `compile(nameToContent: Record<string,string>)` — returns a map of `name -> vm|string|CompilationError`.
       - Reference: `simulator/src/jack/compiler.ts:31`.
     - Include any `.vm` files that are not shadowed by compiled outputs.
   - Parse VM text to instructions via the VM language parser:
     - `VM.parse(source)` → `{ instructions: VmInstruction[] }`.
     - Reference: `simulator/src/languages/vm.ts:1`.
   - Build a runnable VM instance from instructions:
     - `Vm.buildFromFiles(parsedFiles)` or `Vm.build(instructions)`.
     - Entry resolution follows NAND2Tetris rules: prefer `Sys.init`, fallback to `IMPLICIT`, else use the only function present.
     - Reference: `simulator/src/vm/vm.ts:294`.

   Implementation hooks in the CLI:
   - `cli/src/testrunner.ts:198` — `buildVmForTarget(...)` gathers sources, parses, and builds the VM.
   - `cli/src/testrunner.ts:225` — `collectVmSources(...)` compiles `.jack` and reads `.vm` prior to parsing.

3) Execute the VM test
   - Create a VM test runner from the parsed `.tst`:
     - `VMTest.from(tst, { dir, doLoad, doEcho, compareTo })`.
     - Reference: `simulator/src/test/vmtst.ts:18`.
   - CLI wiring:
     - `dir` — set to the `.tst` file path so relative loads and compare files resolve against it.
     - `doLoad` — calls back into `buildVmForTarget(...)` to provide a `Vm` instance when the test executes `load ...`.
     - `compareTo` — reads the requested `.cmp` file for post-run comparison.
     - `doEcho` — pipes `echo` content to the console.
   - Run the test: `await vmTest.run()`.
   - Get the output log: `vmTest.log()`; compare to the `.cmp` captured by `compareTo`.
   - Implementation: `cli/src/testrunner.ts:151` (`runVmTest`).

4) Pass/Fail
   - After the test finishes, the CLI compares `vmTest.log().trim()` to the `.cmp` contents (`trim()`ed) and prints `{ pass, out }`.
   - If they differ, the CLI sets a non-zero exit code.
   - Note: No pointer-specific assertions are hard-coded; the test is only as strict as the `.tst`’s `output-list`.

## Chip/CPU Pipeline (unchanged)

For `.tst` files that do not contain `vmstep`, the CLI defers to the existing chip/CPU runner:

- Loads HDL, `.tst`, and `.cmp`, with fallbacks to built-in project files when local test files are missing.
- Parses HDL and TST, builds the chip and test, runs, and then compares the generated output with the `.cmp`.
- Pass/Fail = exact string equality (trimmed) of the generated log and the `.cmp`.
- Reference (pass computation): `simulator/src/projects/runner.ts:66`.

CLI wiring for the chip path:
- `cli/src/testrunner.ts:85` — calls the shared `runner(fs)` implementation from the simulator.

## APIs Used (new in CLI path)

Simulator/runtime:
- `@nand2tetris/simulator/jack/compiler.js` — Jack → VM compiler.
- `@nand2tetris/simulator/languages/vm.js` — VM parser (`VM.parse`).
- `@nand2tetris/simulator/vm/vm.js` — VM builder/runtime (`Vm.build`, `Vm.buildFromFiles`).
- `@nand2tetris/simulator/test/vmtst.js` — VM test harness (`VMTest.from`, `.run()`, `.log()`).
- `@nand2tetris/simulator/languages/tst.js` — TST parser (`TST.parse`).

Web IDE parity (for reference):
- The web IDE uses the same stack:
  - Parse/Build VM: `components/src/stores/vm.store.ts:279` (`loadVm`),
  - Run tests via `VMTest`: `components/src/stores/vm.store.ts:312` (`loadTest`).

## Error Handling

- TST parse errors: surfaced immediately with context.
- Jack compile errors: collected and reported; aborts before running the test.
- VM parse/build errors: surfaced with message and span when available.
- Compare mismatches: `{ pass: false }` with exit code 1; prints the produced `out` for inspection.

## Notes and Behavior

- `.tst` resolution: the CLI resolves the provided path; if no `.tst` extension is present it appends `.tst`.
- Source discovery: `.jack` and `.vm` are discovered in the test directory. Compiled `.jack` outputs shadow same-named `.vm` files.
- Entry function: the VM runtime selects `Sys.init` when available, otherwise `IMPLICIT`, otherwise the only function defined (see `simulator/src/vm/vm.ts:520`).
- Output: nothing is written unless the script uses `output-file`; comparison is done against the in-memory log.

## Internal Helpers (CLI)

- `testRunner(filePath)` — loads `.tst`, dispatches to VM or chip pipeline. `cli/src/testrunner.ts:70`.
- `runVmTest(fs, tstPath, tstSource)` — orchestrates VM testing. `cli/src/testrunner.ts:151`.
- `buildVmForTarget(fs, targetPath)` — gathers sources, parses, and builds a `Vm`. `cli/src/testrunner.ts:198`.
- `collectVmSources(fs, dir)` — compiles `.jack` and collects `.vm` for VM parsing. `cli/src/testrunner.ts:225`.

## Example

```
nand2tetris compile JackDemo --dst JackDemo   # optional; CLI will compile in-memory too
nand2tetris run JackDemo/SimpleJackVME.tst    # runs VM test, prints { pass, out }
```

