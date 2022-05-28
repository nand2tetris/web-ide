# Nand 2 Tetris - Browser

A Javascript reimplementation of nand2tetris.org.

Project files from "The Elements of Computing Systems" by Nisan and Schocken, MIT Press.

## User Guide

The [user guide](./docs/user_guide/) is available here and also included in the published project at https://davidsouther.github.io/user_guide.

## Architecture

Computron5k is a stand-alone single-page app with separate sections for Hack Hardware, CPU, and VM emulators.
It has a unified file system using browser local storage to save users' solutions to project work.
Emulators share simulator code, especially to handle executing tests as well as converting between Javascript 64-bit floating point numbers and Hack 16-bit integers.
A parser combinator based on [nom](https://docs.rs/nom/5.0.0/nom/) powers the various languages.

### Simulator

Simulator has code to handle running the various emulators, regardless of interface or runtime.
Simulator objects are also independant of language, and serve equally well to running tests as to binding to the DOM or printing to a CLI.
`chip`, `cpu`, and `vm` cover the primary hack languages, with `compare`, `output`, and `tst` handling the common project tooling.

### Languages

Languages includes `parser`, a parser combinator, as well as parsers for each individual language.
The individual languages do _not_ compile to `simulator` objects, but rather to interfaces that meet the output needs of the various combinators.
Later pases perform the final parsing of the tree of tokens to the simulator objects.
`parser` implements [nom's](https://docs.rs/nom/5.0.0/nom/) API, with appropriate TypeScript modifications.
Results are returned using a `Result` type from [`jiffies`](https://github.com/jefri/jiffies/blob/main/src/result.ts).
Input is constrained to a special subset of the TypeScript `string` interface, `StringLike`.
This allows handing `string` objects for quick testing, but also a unique `Span` object which tracks where within a given string the combinator matches.
Using `Span` both communicates positional information about the match, as well as limits copying of string content within the program.

### Pages

The interface code is in the `pages` and `components` folders.

#### Jiffies

Jiffies is an HTML micro-framework. 

#### Pico

Jiffies embeds a custom [`PicoCSS`](https://picocss.com) builder, allowing rapid iteration on custom components.
Some ideas have been moved upstream to Pico.

## Code of Conduct

This project is goverened by its [Code of Conduct](./CODE_OF_CONDUCT.md).