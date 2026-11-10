/**
 * Diagnostics as data. The simulator reports what went wrong as a code and
 * typed arguments; it never builds a sentence. `describeDiagnostic` is the one
 * place that turns a diagnostic into text, in English unless it is given
 * another catalog, and every other presentation (for example a translated
 * one) maps the same codes.
 */

/**
 * The stage that found a diagnostic: `LEX` for a malformed token, `PARSE` for
 * missing or unexpected input, `SEMANTIC` for a well formed but invalid
 * program, and `COMPILE` for a failure while generating output.
 */
export const Stage = Object.freeze({
  LEX: "lex",
  PARSE: "parse",
  SEMANTIC: "semantic",
  COMPILE: "compile",
});

/** One value of `Stage`. */
export type Stage = (typeof Stage)[keyof typeof Stage];

/** A region of source: character offsets and the one based line it starts on. */
export interface Span {
  start: number;
  end: number;
  line: number;
}

/**
 * Every diagnostic code, grouped by the area that reports it, for example
 * `DiagnosticCode.Chip.BUS_RANGE`. Producers and presentations name a code
 * through this constant; the string values are the stable identifiers.
 */
export const DiagnosticCode = Object.freeze({
  Syntax: Object.freeze({
    EXPECTED: "syntax.expected",
  }),
  Error: Object.freeze({
    UNEXPECTED: "error.unexpected",
  }),
  Asm: Object.freeze({
    INVALID_TARGET: "asm.invalidTarget",
    INVALID_VALUE: "asm.invalidValue",
    A_VALUE_RANGE: "asm.aValueRange",
    DUPLICATE_LABEL: "asm.duplicateLabel",
  }),
  Tst: Object.freeze({
    MISSING_LOAD: "tst.missingLoad",
  }),
  Chip: Object.freeze({
    BUS_RANGE: "chip.busRange",
    NOT_LOADED: "chip.notLoaded",
    MULTIPLE_WRITES: "chip.multipleWrites",
    WRONG_NAME: "chip.wrongName",
    NOT_BUILTIN: "chip.notBuiltin",
    NOT_FOUND: "chip.notFound",
    SELF_REFERENCE: "chip.selfReference",
    LOOPING_WIRE: "chip.loopingWire",
    UNDEFINED_PIN: "chip.undefinedPin",
    INTERNAL_PIN_SUBSCRIPTED: "chip.internalPinSubscripted",
    INTERNAL_PIN_REDEFINED: "chip.internalPinRedefined",
    WRITE_TO_INPUT: "chip.writeToInput",
    INTERNAL_PIN_RESERVED: "chip.internalPinReserved",
    OUTPUT_AS_INPUT: "chip.outputAsInput",
    CONSTANT_SUBSCRIPTED: "chip.constantSubscripted",
    CONSTANT_CASE: "chip.constantCase",
    UNDEFINED_INTERNAL_PIN: "chip.undefinedInternalPin",
    BUS_WIDTH_MISMATCH: "chip.busWidthMismatch",
    CONSTANT_BUS_TARGET: "chip.constantBusTarget",
    SUB_BUS_RANGE: "chip.subBusRange",
    CIRCULAR_PINS: "chip.circularPins",
  }),
  Vm: Object.freeze({
    ILLEGAL_SUBROUTINE_NAME: "vm.illegalSubroutineName",
    FILE_NAME_MISMATCH: "vm.fileNameMismatch",
    DUPLICATE_FILE: "vm.duplicateFile",
    ILLEGAL_LOCAL_COUNT: "vm.illegalLocalCount",
    ILLEGAL_ARG_COUNT: "vm.illegalArgCount",
    OS_ARG_COUNT: "vm.osArgCount",
    UNDEFINED_FUNCTION: "vm.undefinedFunction",
    NO_FILES: "vm.noFiles",
    DUPLICATE_LABEL: "vm.duplicateLabel",
    UNDECLARED_LABEL: "vm.undeclaredLabel",
    DUPLICATE_FUNCTION: "vm.duplicateFunction",
    BOOTSTRAP_AND_IMPLICIT: "vm.bootstrapAndImplicit",
    NO_ENTRY_POINT: "vm.noEntryPoint",
    ILLEGAL_OFFSET: "vm.illegalOffset",
    POINTER_OUT_OF_BOUNDS: "vm.pointerOutOfBounds",
    STATIC_OUT_OF_BOUNDS: "vm.staticOutOfBounds",
    TEMP_OUT_OF_BOUNDS: "vm.tempOutOfBounds",
  }),
  Jack: Object.freeze({
    UNDECLARED_VARIABLE: "jack.undeclaredVariable",
    UNKNOWN_TYPE: "jack.unknownType",
    OS_INTERFACE: "jack.osInterface",
    ARG_COUNT: "jack.argCount",
    METHOD_CALLED_AS_FUNCTION: "jack.methodCalledAsFunction",
    CALLED_AS_METHOD: "jack.calledAsMethod",
    MISSING_SUBROUTINE: "jack.missingSubroutine",
    UNDEFINED_CLASS: "jack.undefinedClass",
    CLASS_NAME_MISMATCH: "jack.classNameMismatch",
    DUPLICATE_SUBROUTINE: "jack.duplicateSubroutine",
    MISSING_RETURN_VALUE: "jack.missingReturnValue",
    MISSING_RETURN_PATH: "jack.missingReturnPath",
    DUPLICATE_CLASS_FILE: "jack.duplicateClassFile",
  }),
});

/**
 * The arguments of each diagnostic code. A code names one user visible
 * problem, and its arguments hold every value that problem mentions.
 */
export interface DiagnosticArgs {
  // Syntax errors derived from a failed match.
  /** The input did not match; `expected` lists what would have matched. */
  [DiagnosticCode.Syntax.EXPECTED]: { expected: readonly string[] };

  // Unexpected failures that carry only a programmer facing message.
  [DiagnosticCode.Error.UNEXPECTED]: { message: string };

  // Assembly.
  [DiagnosticCode.Asm.INVALID_TARGET]: { target: string; suggestion?: string };
  [DiagnosticCode.Asm.INVALID_VALUE]: { value: string; suggestion?: string };
  [DiagnosticCode.Asm.A_VALUE_RANGE]: { value: number };
  [DiagnosticCode.Asm.DUPLICATE_LABEL]: { label: string };

  // Test scripts.
  [DiagnosticCode.Tst.MISSING_LOAD]: Record<string, never>;

  // HDL chips.
  [DiagnosticCode.Chip.BUS_RANGE]: Record<string, never>;
  [DiagnosticCode.Chip.NOT_LOADED]: { file: string };
  [DiagnosticCode.Chip.MULTIPLE_WRITES]: { pin: string; index?: number };
  [DiagnosticCode.Chip.WRONG_NAME]: Record<string, never>;
  [DiagnosticCode.Chip.NOT_BUILTIN]: { name: string };
  [DiagnosticCode.Chip.NOT_FOUND]: { name: string };
  [DiagnosticCode.Chip.SELF_REFERENCE]: { name: string };
  [DiagnosticCode.Chip.LOOPING_WIRE]: { pin: string };
  [DiagnosticCode.Chip.UNDEFINED_PIN]: { pin: string };
  [DiagnosticCode.Chip.INTERNAL_PIN_SUBSCRIPTED]: { pin: string };
  [DiagnosticCode.Chip.INTERNAL_PIN_REDEFINED]: { pin: string };
  [DiagnosticCode.Chip.WRITE_TO_INPUT]: { pin: string };
  [DiagnosticCode.Chip.INTERNAL_PIN_RESERVED]: Record<string, never>;
  [DiagnosticCode.Chip.OUTPUT_AS_INPUT]: Record<string, never>;
  [DiagnosticCode.Chip.CONSTANT_SUBSCRIPTED]: Record<string, never>;
  [DiagnosticCode.Chip.CONSTANT_CASE]: { name: string };
  [DiagnosticCode.Chip.UNDEFINED_INTERNAL_PIN]: { name: string };
  [DiagnosticCode.Chip.BUS_WIDTH_MISMATCH]: {
    lhs: string;
    lhsWidth: number | undefined;
    rhs: string;
    rhsWidth: number | undefined;
  };
  [DiagnosticCode.Chip.CONSTANT_BUS_TARGET]: Record<string, never>;
  [DiagnosticCode.Chip.SUB_BUS_RANGE]: { pin: string; width: number };
  [DiagnosticCode.Chip.CIRCULAR_PINS]: Record<string, never>;

  // VM programs.
  [DiagnosticCode.Vm.ILLEGAL_SUBROUTINE_NAME]: { name: string };
  [DiagnosticCode.Vm.FILE_NAME_MISMATCH]: {
    file: string;
    className: string;
    name: string;
  };
  [DiagnosticCode.Vm.DUPLICATE_FILE]: { file: string };
  [DiagnosticCode.Vm.ILLEGAL_LOCAL_COUNT]: { count: number };
  [DiagnosticCode.Vm.ILLEGAL_ARG_COUNT]: { count: number };
  [DiagnosticCode.Vm.OS_ARG_COUNT]: {
    name: string;
    expected: number;
    received: number;
  };
  [DiagnosticCode.Vm.UNDEFINED_FUNCTION]: { name: string };
  [DiagnosticCode.Vm.NO_FILES]: Record<string, never>;
  [DiagnosticCode.Vm.DUPLICATE_LABEL]: {
    label: string;
    function: string;
    line: number;
  };
  [DiagnosticCode.Vm.UNDECLARED_LABEL]: { label: string };
  [DiagnosticCode.Vm.DUPLICATE_FUNCTION]: { name: string };
  [DiagnosticCode.Vm.BOOTSTRAP_AND_IMPLICIT]: Record<string, never>;
  [DiagnosticCode.Vm.NO_ENTRY_POINT]: Record<string, never>;
  [DiagnosticCode.Vm.ILLEGAL_OFFSET]: { offset: number };
  [DiagnosticCode.Vm.POINTER_OUT_OF_BOUNDS]: { offset: number };
  [DiagnosticCode.Vm.STATIC_OUT_OF_BOUNDS]: { offset: number };
  [DiagnosticCode.Vm.TEMP_OUT_OF_BOUNDS]: { offset: number };

  // Jack classes.
  [DiagnosticCode.Jack.UNDECLARED_VARIABLE]: { name: string };
  [DiagnosticCode.Jack.UNKNOWN_TYPE]: { type: string };
  [DiagnosticCode.Jack.OS_INTERFACE]: {
    class: string;
    subroutine: string;
    signature: string;
  };
  [DiagnosticCode.Jack.ARG_COUNT]: {
    name: string;
    expected: number;
    received: number;
  };
  [DiagnosticCode.Jack.METHOD_CALLED_AS_FUNCTION]: { name: string };
  [DiagnosticCode.Jack.CALLED_AS_METHOD]: { kind: string; name: string };
  [DiagnosticCode.Jack.MISSING_SUBROUTINE]: {
    class: string;
    subroutine: string;
  };
  [DiagnosticCode.Jack.UNDEFINED_CLASS]: { name: string };
  [DiagnosticCode.Jack.CLASS_NAME_MISMATCH]: { name: string; file: string };
  [DiagnosticCode.Jack.DUPLICATE_CLASS_FILE]: { path: string; other: string };
  [DiagnosticCode.Jack.DUPLICATE_SUBROUTINE]: { name: string };
  [DiagnosticCode.Jack.MISSING_RETURN_VALUE]: Record<string, never>;
  [DiagnosticCode.Jack.MISSING_RETURN_PATH]: { name: string };
}

/** The name of a user visible problem: one value of `DiagnosticCode`. */
export type DiagnosticCode = {
  [G in keyof typeof DiagnosticCode]: (typeof DiagnosticCode)[G][keyof (typeof DiagnosticCode)[G]];
}[keyof typeof DiagnosticCode];

/** What went wrong, without where or when: a code with its arguments. */
export type Fault = {
  [C in DiagnosticCode]: { code: C; args: DiagnosticArgs[C] };
}[DiagnosticCode];

/**
 * One diagnostic: a fault and, when known, where it applies and which stage
 * found it. Narrowing on `code` narrows `args`.
 */
export type Diagnostic = Fault & {
  span?: Span;
  stage?: Stage;
};

/** One or more diagnostics, first error first. */
export type Diagnostics = readonly [Diagnostic, ...Diagnostic[]];

/** A fault of `code`; the arguments must be those of the code. */
export function fault<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
): Fault {
  return { code, args } as Fault;
}

/**
 * A diagnostic of `code`; the arguments must be those of the code. Absent
 * `span` and `stage` leave no key.
 */
export function diagnostic<C extends DiagnosticCode>(
  code: C,
  args: DiagnosticArgs[C],
  span?: Span,
  stage?: Stage,
): Diagnostic {
  return {
    code,
    args,
    ...(span === undefined ? {} : { span }),
    ...(stage === undefined ? {} : { stage }),
  } as Diagnostic;
}

/** `fault` placed at `span` and found by `stage`. */
export function located(found: Fault, span?: Span, stage?: Stage): Diagnostic {
  return {
    ...found,
    ...(span === undefined ? {} : { span }),
    ...(stage === undefined ? {} : { stage }),
  } as Diagnostic;
}

/** A stable text of a diagnostic's code and arguments, for identity checks. */
export function faultKey({ code, args }: Fault): string {
  return JSON.stringify([
    code,
    Object.entries(args as Record<string, unknown>).sort(([a], [b]) =>
      a < b ? -1 : a > b ? 1 : 0,
    ),
  ]);
}

/** Expectations as Ohm words them: `a`, `a or b`, `a, b, or c`. */
function listOf(items: readonly string[]): string {
  return items
    .map((item, i) => {
      if (i === 0) return item;
      if (i < items.length - 1) return `, ${item}`;
      return `${items.length > 2 ? ", or " : " or "}${item}`;
    })
    .join("");
}

/** The suffix that offers a corrected spelling of an invalid ASM word. */
function suggested(suggestion: string | undefined): string {
  return suggestion === undefined ? "" : `. Did you mean ${suggestion}?`;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * How a language words diagnostics: the prefix that names a line, and a
 * template for every code. Adding a code requires a template in each catalog.
 */
export interface Catalog {
  line: (line: number) => string;
  messages: { [C in DiagnosticCode]: (args: DiagnosticArgs[C]) => string };
}

/** The English catalog. */
export const ENGLISH: Catalog = {
  line: (line) => `Line ${line}: `,
  messages: {
    [DiagnosticCode.Syntax.EXPECTED]: ({ expected }) =>
      `expected ${listOf(expected)}`,

    [DiagnosticCode.Error.UNEXPECTED]: ({ message }) => message,

    [DiagnosticCode.Asm.INVALID_TARGET]: ({ target, suggestion }) =>
      `Invalid ASM target: ${target}${suggested(suggestion)}`,
    [DiagnosticCode.Asm.INVALID_VALUE]: ({ value, suggestion }) =>
      `Invalid ASM value: ${value}${suggested(suggestion)}`,
    [DiagnosticCode.Asm.A_VALUE_RANGE]: ({ value }) =>
      `${value} is invalid for an A instruction (should be 0 to 32767)`,
    [DiagnosticCode.Asm.DUPLICATE_LABEL]: ({ label }) =>
      `Duplicate label ${label}`,

    [DiagnosticCode.Tst.MISSING_LOAD]: () =>
      "A test script must have a load command",

    [DiagnosticCode.Chip.BUS_RANGE]: () =>
      "Bus start index should be less than or equal to bus end index",
    [DiagnosticCode.Chip.NOT_LOADED]: ({ file }) =>
      `Could not load chip ${file}`,
    [DiagnosticCode.Chip.MULTIPLE_WRITES]: ({ pin, index }) =>
      `Cannot write to pin ${pin}${
        index === undefined ? "" : `[${index}]`
      } multiple times`,
    [DiagnosticCode.Chip.WRONG_NAME]: () => "Wrong chip name",
    [DiagnosticCode.Chip.NOT_BUILTIN]: ({ name }) =>
      `Chip ${name} not in builtin registry`,
    [DiagnosticCode.Chip.NOT_FOUND]: ({ name }) =>
      `Undefined chip name: ${name}`,
    [DiagnosticCode.Chip.SELF_REFERENCE]: ({ name }) =>
      `Cannot use chip ${name} to implement itself`,
    [DiagnosticCode.Chip.LOOPING_WIRE]: ({ pin }) => `Looping wire ${pin}`,
    [DiagnosticCode.Chip.UNDEFINED_PIN]: ({ pin }) =>
      `Undefined pin name: ${pin}`,
    [DiagnosticCode.Chip.INTERNAL_PIN_SUBSCRIPTED]: ({ pin }) =>
      `Internal pins (in this case: ${pin}) cannot be subscripted or indexed`,
    [DiagnosticCode.Chip.INTERNAL_PIN_REDEFINED]: ({ pin }) =>
      `Internal pin ${pin} already defined`,
    [DiagnosticCode.Chip.WRITE_TO_INPUT]: ({ pin }) =>
      `Cannot write to input pin ${pin}`,
    [DiagnosticCode.Chip.INTERNAL_PIN_RESERVED]: () =>
      `Internal pin name cannot be "true" or "false"`,
    [DiagnosticCode.Chip.OUTPUT_AS_INPUT]: () =>
      "Cannot use output pin as input",
    [DiagnosticCode.Chip.CONSTANT_SUBSCRIPTED]: () =>
      "Constant bus cannot be subscripted or indexed",
    [DiagnosticCode.Chip.CONSTANT_CASE]: ({ name }) =>
      `The constant bus ${name} must be in lower-case`,
    [DiagnosticCode.Chip.UNDEFINED_INTERNAL_PIN]: ({ name }) =>
      `Undefined internal pin name: ${name}`,
    [DiagnosticCode.Chip.BUS_WIDTH_MISMATCH]: ({
      lhs,
      lhsWidth,
      rhs,
      rhsWidth,
    }) => `Different bus widths: ${lhs}(${lhsWidth}) and ${rhs}(${rhsWidth})`,
    [DiagnosticCode.Chip.CONSTANT_BUS_TARGET]: () =>
      "Cannot wire to constant bus",
    [DiagnosticCode.Chip.SUB_BUS_RANGE]: ({ pin, width }) =>
      `Sub-bus index out of range (${pin} has width ${width})`,
    [DiagnosticCode.Chip.CIRCULAR_PINS]: () => "Circular pin dependency",

    [DiagnosticCode.Vm.ILLEGAL_SUBROUTINE_NAME]: ({ name }) =>
      `Illegal subroutine name ${name} (Expected <className>.<SubroutineName>)`,
    [DiagnosticCode.Vm.FILE_NAME_MISMATCH]: ({ file, className, name }) =>
      `File name ${file} doesn't match class name ${className} (at ${name})`,
    [DiagnosticCode.Vm.DUPLICATE_FILE]: ({ file }) =>
      `File ${file} already exists`,
    [DiagnosticCode.Vm.ILLEGAL_LOCAL_COUNT]: ({ count }) =>
      `Illegal number of local variables ${count} (Expected 0-32767)`,
    [DiagnosticCode.Vm.ILLEGAL_ARG_COUNT]: ({ count }) =>
      `Illegal number of arguments ${count} (Expected 0-32767)`,
    [DiagnosticCode.Vm.OS_ARG_COUNT]: ({ name, expected, received }) =>
      `OS function ${name} expects ${expected} arguments, not ${received}`,
    [DiagnosticCode.Vm.UNDEFINED_FUNCTION]: ({ name }) =>
      `Undefined function ${name}`,
    [DiagnosticCode.Vm.NO_FILES]: () =>
      "No .vm files to load. Compile your Jack files first.",
    [DiagnosticCode.Vm.DUPLICATE_LABEL]: ({ label, function: fn, line }) =>
      `Cannot redeclare label ${label} in function ${fn} (previously at line ${line})`,
    [DiagnosticCode.Vm.UNDECLARED_LABEL]: ({ label }) =>
      `Undeclared label ${label}`,
    [DiagnosticCode.Vm.DUPLICATE_FUNCTION]: ({ name }) =>
      `VM Already has a function named ${name}`,
    [DiagnosticCode.Vm.BOOTSTRAP_AND_IMPLICIT]: () =>
      "Cannot use both bootstrap and an implicit function",
    [DiagnosticCode.Vm.NO_ENTRY_POINT]: () =>
      "Could not determine an entry point for VM",
    [DiagnosticCode.Vm.ILLEGAL_OFFSET]: ({ offset }) =>
      `Illegal offset value ${offset} (must be between 0 and 32767)`,
    [DiagnosticCode.Vm.POINTER_OUT_OF_BOUNDS]: ({ offset }) =>
      `pointer out of bounds access (pointer can be 0 for this, 1 for that, but got ${offset}`,
    [DiagnosticCode.Vm.STATIC_OUT_OF_BOUNDS]: ({ offset }) =>
      `Cannot access statics beyond 239: ${offset}`,
    [DiagnosticCode.Vm.TEMP_OUT_OF_BOUNDS]: ({ offset }) =>
      `Temp out of bounds access (temp can be 0 to 7, but got ${offset}`,

    [DiagnosticCode.Jack.UNDECLARED_VARIABLE]: ({ name }) =>
      `Undeclared variable ${name}`,
    [DiagnosticCode.Jack.UNKNOWN_TYPE]: ({ type }) => `Unknown type ${type}`,
    [DiagnosticCode.Jack.OS_INTERFACE]: ({
      class: cls,
      subroutine,
      signature,
    }) =>
      `OS subroutine ${cls}.${subroutine} must follow the interface ${signature})`,
    [DiagnosticCode.Jack.ARG_COUNT]: ({ name, expected, received }) =>
      `${name} expected ${expected} arguments, got ${received}`,
    [DiagnosticCode.Jack.METHOD_CALLED_AS_FUNCTION]: ({ name }) =>
      `Method ${name} was called as a function/constructor`,
    [DiagnosticCode.Jack.CALLED_AS_METHOD]: ({ kind, name }) =>
      `${capitalize(kind)} ${name} was called as a method`,
    [DiagnosticCode.Jack.MISSING_SUBROUTINE]: ({ class: cls, subroutine }) =>
      `Class ${cls} doesn't contain a function/constructor ${subroutine}`,
    [DiagnosticCode.Jack.UNDEFINED_CLASS]: ({ name }) =>
      `Class ${name} doesn't exist`,
    [DiagnosticCode.Jack.CLASS_NAME_MISMATCH]: ({ name, file }) =>
      `Class name ${name} doesn't match file name ${file}`,
    [DiagnosticCode.Jack.DUPLICATE_CLASS_FILE]: ({ path, other }) =>
      `${path} repeats the class file ${other}`,
    [DiagnosticCode.Jack.DUPLICATE_SUBROUTINE]: ({ name }) =>
      `Subroutine ${name} already declared`,
    [DiagnosticCode.Jack.MISSING_RETURN_VALUE]: () =>
      "A non void subroutine must return a value",
    [DiagnosticCode.Jack.MISSING_RETURN_PATH]: ({ name }) =>
      `Subroutine ${name}: not all code paths return a value`,
  },
};

/**
 * The text of a diagnostic in `catalog`, prefixed with the catalog's line
 * prefix when its span has a line.
 */
export function describeDiagnostic(
  found: Diagnostic,
  catalog: Catalog = ENGLISH,
): string {
  const template = catalog.messages[found.code] as (args: unknown) => string;
  const line = found.span?.line;
  return `${line === undefined ? "" : catalog.line(line)}${template(found.args)}`;
}
