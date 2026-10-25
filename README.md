# Nand2Tetris Software Suite

A Javascript reimplementation of the software suite described in www.nand2tetris.org and in "The Elements of Computing Systems" by Nisan and Schocken, MIT Press (2nd edition, 2021). The repo also includes the project files described in the website and in the book.

The goal is to allow students complete the projects using modern, web-based tools, without having to download code to their computers.

Users can work with the tools via a web IDE, or via a VS Code extension. Both are described below.

## User Guide

The user guides for the web IDE are available [here](https://drive.google.com/drive/folders/10hDzWql94MTPIStI3KEx--JYpHTBoeE6) and can also be accessed by clicking "Guide" at the top right of the [published project](https://nand2tetris.github.io/web-ide).

The user guide for the extension is coming.

The parts of the user guide that describe the UI may be out of sync with the code since we keep experimenting with different UIs.

### CLI

Install the CLI tool:

    npm install
    npm run build && npm i -g ./cli

Run the CLI:

    cd nand2tetris/project/01
    nand2tetris grade
    nand2tetris run DMux4Way.tst

Run the CLI with a nand2tetris Java install. The `--java_ide` option defaults to `$NAND2TETRIS_PATH`.

    cd nand2tetris/project/01
    nand2tetris grade --java_ide=${HOME}/nand2tetris

### Web IDE

Build the web IDE:

    npm install
    npm run build && npm run start

The dev server prints its URL, <http://localhost:5173/web-ide/>, to the console. Changes in `web` reload automatically. To rebuild the libraries on change as well, run `npm run watch` in a second terminal.

[CONTRIBUTING.md](./CONTRIBUTING.md) explains how to set up a development environment and send changes.

## Architecture

NAND2Tetris kit is a monorepo with several packages.
[DEVELOPMENT.md](./DEVELOPMENT.md#package-roles) lists each package's role and the order they build in.
The sections below describe the larger subsystems.

### Simulator

Simulator has code to handle running the various emulators, regardless of interface or runtime.
Simulator objects are also independent of language, and serve equally well to running tests as to binding to the DOM or printing to a CLI.
`chip`, `cpu`, and `vm` cover the primary hack languages, with `compare`, `output`, and `test` handling the common project tooling.

#### Languages

Languages are parsed using [Ohm](https://ohmjs.org/), a parser combinator library.
Ohm works well for simple cases, but does not handle error recovery well.
Replacing or augmenting this to handle a number of errors, rather than only the first, is a possible future improvement.

### Web

NAND2Tetris Web IDE is a stand-alone single-page app with separate sections for Hack Hardware, CPU, and VM emulators.
It has a unified file system that saves users' solutions in browser storage or, in Chromium browsers, in a folder on the user's computer.
Emulators share simulator code, especially to handle executing tests as well as converting between Javascript 64-bit floating point numbers and Hack 16-bit integers.

The interface code is in the `pages` and `components` folders.
Generally, a page creates a simulator at the top, some dynamic components in the middle, and a layout of HTML at the bottom.
Pages should use semantic blocks as much as possible, with special attention on using `<article>` as a "Card".

#### React

The user interface is written in React, using functional components and vanilla hooks as much as possible.
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

- `npm run -w extension package` builds the extension & related views into a standalone `.vsix` file.
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
