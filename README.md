# Nand2Tetris Software Suite

A Javascript reimplementation of the software suite described in www.nand2tetris.org and in "The Elements of Computing Systems" by Nisan and Schocken, MIT Press (2nd edition, 2021). The repo also includes the project files described in the website and in the book.

Presently the implementation focuses on the Hardware Simulator (projects 1, 2, 3, 5). The CPU and the VM Emulators will be next. The goal is to allow students complete the projects using modern, web-based tools, without having to download code to their computers.

Users can work with the tools via a web IDE, or via a VS Code extension. Both are described below.

## User Guide

The user guides for the web IDE are available [here](https://drive.google.com/drive/folders/10hDzWql94MTPIStI3KEx--JYpHTBoeE6) and can also be accessed by clicking "Guide" at the top right of the [published project](https://nand2tetris.github.io/web-ide).

The user guide for the extension is coming.

The parts of the user guide that describe the UI may be out of sync with the code since we keep experimenting with differtent UI's.

### CLI

Install the CLI tool:

    npm run build && npm i -g ./cli

Run the CLI:

    cd nand2tetris/project/01
    nand2tetris grade
    nand2tetris run DMux4Way.tst

Run the CLI with a nand2tetris Java install:

    cd nand2tetris/project/01
    nand2tetris grade --java_ide=${HOME}/nand2tetris

## Architecture

NAND2Tetris kit is a monorepo with several projects.
`simulator` is the core NAND2Tetris code.
`projects` has copies of project base and test files.
`runner` is a utility to execute chips against a Java ide install, looking for nand2tetris.jar in $NAND2TETRIS_PATH.
`components` are reusable React UI pieces suitable for both web and extension.
`web` is a standalone web IDE.
`extension` is a VSCode extension with editor support.
`cli` is a command line NodeJS program (runnable with `npx`) to grade one or more project folders.

### Simulator

Simulator has code to handle running the various emulators, regardless of interface or runtime.
Simulator objects are also independant of language, and serve equally well to running tests as to binding to the DOM or printing to a CLI.
`chip`, `cpu`, and `vm` cover the primary hack languages, with `compare`, `output`, and `tst` handling the common project tooling.

#### Languages

Languages are parsed using [Ohm](https://ohmjs.org/), a parser combinator library.
Ohm works well for simple cases, but does not handle error recovery well.
Replacing or augmenting this to handle a number of errors, rather than only the first, w

### Web

NAND2Tetris Web IDE is a stand-alone single-page app with separate sections for Hack Hardware, CPU, and VM emulators.
It has a unified file system using browser local storage to save users' solutions to project work.
Emulators share simulator code, especially to handle executing tests as well as converting between Javascript 64-bit floating point numbers and Hack 16-bit integers.

The interface code is in the `pages` and `components` folders.
Generally, a page creates a simulator at the top, some dynamic components in the middle, and a layout of HTML at the bottom.
Pages should use semantic blocks as much as possible, with special attention on using `<article>` as a "Card".

#### React

The user interface is written in react, using functional components and vanilla hooks as much as possible.
Pages are routable things, usually with a store connecting it to the appropriate simulation.
Components are reusable pieces of UI, which take props to update their interface.

#### RXJS

Asynchronous one-off behavior in the project can be handled with promises & async/await syntax.
For evented asynchronous behavior, use RXJS observables and subscriptions.

#### Pico

Jiffies extends [`PicoCSS`](https://picocss.com), allowing rapid iteration on custom components.
Some ideas have been moved upstream to Pico.
Specific components in the forked Pico include [`inline-buttons`](https://github.com/picocss/pico/issues/182) and a [`property sheet`](https://github.com/picocss/pico/issues/195).

### Extension

A VSCode extension with language definitions and editor support.

- `npm run -w extension package` builds the extension & related views into a stand-along `.vsix` file.
- `Run Extension` launch configuration starts a new VSCode extension host to debug the extension.

#### Languages

Language support for `.hdl` & `.tst` uses the language libraries in `simulator`.
Syntax errors are highlighted, with in-editor error diagnostics on the failing token.
Syntax highlighting rules activate for `HDL`, `TST`, `CMP`, `OUT`, `ASM`, `VM`, and `Jack` files.
Snippets are available for `HDL`, `ASM`, `VM`, `Jack`, and `TST` files.

#### Views

The extension adds an activity bar container, `NAND2Tetris`.
`NAND2TETRIS: HDL CHIP` opens in the container, and shows a chip panel when the user has opened an HDL file.
The panel attempts to update whenever changing HDL files, or when saving the file.
It does not update if the new HDL does not parse.

### Jiffies

Jiffies contains a few utility functions & types.

- `Result` and `Option` encapsulate "Ok/Err" and "Some/None" variant types.
- `assert`, `assertExists`, and `checkExhaustive` provide strongly-typed, portable assertions.
- `fs`, a thin wrapper around LocalStorage and similar `Record<string, string>` objects allowing Filesystem like access.

## Code of Conduct

This project is governed by its [Code of Conduct](./CODE_OF_CONDUCT.md).
