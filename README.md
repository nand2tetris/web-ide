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
Generally, a page creates a simulator at the top, some dynamic components in the middle, and a layout of HTML at the bottom.
Pages should use semantic blocks as much as possible, with special attention on using `<article>` as a "Card".

#### Jiffies

Jiffies is an HTML micro-framework.
HTML tags are exported as functions, which take an optional first parameter object of their attributes, and a variadic rest parameter as their children.
Children can be either `string` or further HTML-Like entities.
HTML-like means either an `Element`, or more likely, a Jiffies-augmented updateable element.
Jiffies wraps and extends created elements with an `update` method, which itself takes the optional first parameter of objects and variadic rest parameter of children.

The optional attributes object gets applieed to the `Element` property-by-property, except for `style` and `events`.
`style` as an attribute takes either a string, in which case it will be applied to the `style` attribute directly, or more commonly (because it has better typing) an object, wich keys and values being assigned into the `style` attribute on the object individually.
`event` is an object whose keys are the appropriate event types for `addEventListener`, and whose values are functions to execute when the event is triggered.
Note that no pre-processing is done on the `Event`, so for instance a form `submit` handler would be appropriate to call `preventPropagation`.

When using the `update` method, children are always replaced.
To reuse a child, store a reference to it in some context, and reuse it when calling update.
`null` and `undefined` are treated differently as values in the `attribute` object (and the `style` and `events` children).
`undefined`, that is, unset, properties are not modified during update.
`null` properties are unset, including calling `removeEventListener` with the original function reference when `null` is in the `event` key.
Otherwise, the current value of the attribute or event listener is replaced.
Those components needing multiple listeners on a single event should install one listener which dispatches to its own list of functions, or provide a `subject` for the listener.

#### Pico

Jiffies embeds a custom [`PicoCSS`](https://picocss.com) builder, allowing rapid iteration on custom components.
Some ideas have been moved upstream to Pico.

## Code of Conduct

This project is goverened by its [Code of Conduct](./CODE_OF_CONDUCT.md).
