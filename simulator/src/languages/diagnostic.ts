/**
 * Diagnostics as data. The simulator reports what went wrong as a code and
 * typed arguments; it never builds a sentence. `describeEnglish` is the one
 * place that turns a diagnostic into English, and every other presentation
 * (for example a translated one) maps the same codes.
 */

/**
 * The stage that found a diagnostic: `lex` for a malformed token, `parse` for
 * missing or unexpected input, `semantic` for a well formed but invalid
 * program, and `compile` for a failure while generating output.
 */
export type Stage = "lex" | "parse" | "semantic" | "compile";

/** A region of source: character offsets and the one based line it starts on. */
export interface Span {
  start: number;
  end: number;
  line: number;
}

/**
 * The arguments of each diagnostic code. A code names one user visible
 * problem, and its arguments hold every value that problem mentions.
 */
export interface DiagnosticArgs {
  // Syntax errors derived from a failed match.
  /** The input did not match; `expected` lists what would have matched. */
  "syntax.expected": { expected: readonly string[] };

  // Unexpected failures that carry only a programmer facing message.
  "error.unexpected": { message: string };

  // Assembly.
  "asm.invalidTarget": { target: string; suggestion?: string };
  "asm.invalidValue": { value: string; suggestion?: string };
  "asm.aValueRange": { value: number };
  "asm.duplicateLabel": { label: string };

  // Test scripts.
  "tst.missingLoad": Record<string, never>;

  // HDL chips.
  "chip.busRange": Record<string, never>;
  "chip.notLoaded": { file: string };
  "chip.multipleWrites": { pin: string; index?: number };
  "chip.wrongName": Record<string, never>;
  "chip.notBuiltin": { name: string };
  "chip.notFound": { name: string };
  "chip.selfReference": { name: string };
  "chip.loopingWire": { pin: string };
  "chip.undefinedPin": { pin: string };
  "chip.internalPinSubscripted": { pin: string };
  "chip.internalPinRedefined": { pin: string };
  "chip.writeToInput": { pin: string };
  "chip.internalPinReserved": Record<string, never>;
  "chip.outputAsInput": Record<string, never>;
  "chip.constantSubscripted": Record<string, never>;
  "chip.constantCase": { name: string };
  "chip.undefinedInternalPin": { name: string };
  "chip.busWidthMismatch": {
    lhs: string;
    lhsWidth: number | undefined;
    rhs: string;
    rhsWidth: number | undefined;
  };
  "chip.constantBusTarget": Record<string, never>;
  "chip.subBusRange": { pin: string; width: number };
  "chip.circularPins": Record<string, never>;

  // VM programs.
  "vm.illegalSubroutineName": { name: string };
  "vm.fileNameMismatch": { file: string; className: string; name: string };
  "vm.duplicateFile": { file: string };
  "vm.illegalLocalCount": { count: number };
  "vm.illegalArgCount": { count: number };
  "vm.osArgCount": { name: string; expected: number; received: number };
  "vm.undefinedFunction": { name: string };
  "vm.noFiles": Record<string, never>;
  "vm.duplicateLabel": { label: string; function: string; line: number };
  "vm.undeclaredLabel": { label: string };
  "vm.duplicateFunction": { name: string };
  "vm.bootstrapAndImplicit": Record<string, never>;
  "vm.noEntryPoint": Record<string, never>;
  "vm.illegalOffset": { offset: number };
  "vm.pointerOutOfBounds": { offset: number };
  "vm.staticOutOfBounds": { offset: number };
  "vm.tempOutOfBounds": { offset: number };

  // Jack classes.
  "jack.undeclaredVariable": { name: string };
  "jack.unknownType": { type: string };
  "jack.osInterface": { class: string; subroutine: string; signature: string };
  "jack.argCount": { name: string; expected: number; received: number };
  "jack.methodCalledAsFunction": { name: string };
  "jack.calledAsMethod": { kind: string; name: string };
  "jack.missingSubroutine": { class: string; subroutine: string };
  "jack.undefinedClass": { name: string };
  "jack.classNameMismatch": { name: string; file: string };
  "jack.duplicateSubroutine": { name: string };
  "jack.missingReturnValue": Record<string, never>;
  "jack.missingReturnPath": { name: string };
}

/** The name of a user visible problem. */
export type DiagnosticCode = keyof DiagnosticArgs;

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

/** Every English template, one per code. Adding a code requires a template. */
const ENGLISH: { [C in DiagnosticCode]: (args: DiagnosticArgs[C]) => string } =
  {
    "syntax.expected": ({ expected }) => `expected ${listOf(expected)}`,

    "error.unexpected": ({ message }) => message,

    "asm.invalidTarget": ({ target, suggestion }) =>
      `Invalid ASM target: ${target}${suggested(suggestion)}`,
    "asm.invalidValue": ({ value, suggestion }) =>
      `Invalid ASM value: ${value}${suggested(suggestion)}`,
    "asm.aValueRange": ({ value }) =>
      `${value} is invalid for an A instruction (should be 0 to 32767)`,
    "asm.duplicateLabel": ({ label }) => `Duplicate label ${label}`,

    "tst.missingLoad": () => "A test script must have a load command",

    "chip.busRange": () =>
      "Bus start index should be less than or equal to bus end index",
    "chip.notLoaded": ({ file }) => `Could not load chip ${file}`,
    "chip.multipleWrites": ({ pin, index }) =>
      `Cannot write to pin ${pin}${
        index === undefined ? "" : `[${index}]`
      } multiple times`,
    "chip.wrongName": () => "Wrong chip name",
    "chip.notBuiltin": ({ name }) => `Chip ${name} not in builtin registry`,
    "chip.notFound": ({ name }) => `Undefined chip name: ${name}`,
    "chip.selfReference": ({ name }) =>
      `Cannot use chip ${name} to implement itself`,
    "chip.loopingWire": ({ pin }) => `Looping wire ${pin}`,
    "chip.undefinedPin": ({ pin }) => `Undefined pin name: ${pin}`,
    "chip.internalPinSubscripted": ({ pin }) =>
      `Internal pins (in this case: ${pin}) cannot be subscripted or indexed`,
    "chip.internalPinRedefined": ({ pin }) =>
      `Internal pin ${pin} already defined`,
    "chip.writeToInput": ({ pin }) => `Cannot write to input pin ${pin}`,
    "chip.internalPinReserved": () =>
      `Internal pin name cannot be "true" or "false"`,
    "chip.outputAsInput": () => "Cannot use output pin as input",
    "chip.constantSubscripted": () =>
      "Constant bus cannot be subscripted or indexed",
    "chip.constantCase": ({ name }) =>
      `The constant bus ${name} must be in lower-case`,
    "chip.undefinedInternalPin": ({ name }) =>
      `Undefined internal pin name: ${name}`,
    "chip.busWidthMismatch": ({ lhs, lhsWidth, rhs, rhsWidth }) =>
      `Different bus widths: ${lhs}(${lhsWidth}) and ${rhs}(${rhsWidth})`,
    "chip.constantBusTarget": () => "Cannot wire to constant bus",
    "chip.subBusRange": ({ pin, width }) =>
      `Sub-bus index out of range (${pin} has width ${width})`,
    "chip.circularPins": () => "Circular pin dependency",

    "vm.illegalSubroutineName": ({ name }) =>
      `Illegal subroutine name ${name} (Expected <className>.<SubroutineName>)`,
    "vm.fileNameMismatch": ({ file, className, name }) =>
      `File name ${file} doesn't match class name ${className} (at ${name})`,
    "vm.duplicateFile": ({ file }) => `File ${file} already exists`,
    "vm.illegalLocalCount": ({ count }) =>
      `Illegal number of local variables ${count} (Expected 0-32767)`,
    "vm.illegalArgCount": ({ count }) =>
      `Illegal number of arguments ${count} (Expected 0-32767)`,
    "vm.osArgCount": ({ name, expected, received }) =>
      `OS function ${name} expects ${expected} arguments, not ${received}`,
    "vm.undefinedFunction": ({ name }) => `Undefined function ${name}`,
    "vm.noFiles": () => "No .vm files to load. Compile your Jack files first.",
    "vm.duplicateLabel": ({ label, function: fn, line }) =>
      `Cannot redeclare label ${label} in function ${fn} (previously at line ${line})`,
    "vm.undeclaredLabel": ({ label }) => `Undeclared label ${label}`,
    "vm.duplicateFunction": ({ name }) =>
      `VM Already has a function named ${name}`,
    "vm.bootstrapAndImplicit": () =>
      "Cannot use both bootstrap and an implicit function",
    "vm.noEntryPoint": () => "Could not determine an entry point for VM",
    "vm.illegalOffset": ({ offset }) =>
      `Illegal offset value ${offset} (must be between 0 and 32767)`,
    "vm.pointerOutOfBounds": ({ offset }) =>
      `pointer out of bounds access (pointer can be 0 for this, 1 for that, but got ${offset}`,
    "vm.staticOutOfBounds": ({ offset }) =>
      `Cannot access statics beyond 239: ${offset}`,
    "vm.tempOutOfBounds": ({ offset }) =>
      `Temp out of bounds access (temp can be 0 to 7, but got ${offset}`,

    "jack.undeclaredVariable": ({ name }) => `Undeclared variable ${name}`,
    "jack.unknownType": ({ type }) => `Unknown type ${type}`,
    "jack.osInterface": ({ class: cls, subroutine, signature }) =>
      `OS subroutine ${cls}.${subroutine} must follow the interface ${signature})`,
    "jack.argCount": ({ name, expected, received }) =>
      `${name} expected ${expected} arguments, got ${received}`,
    "jack.methodCalledAsFunction": ({ name }) =>
      `Method ${name} was called as a function/constructor`,
    "jack.calledAsMethod": ({ kind, name }) =>
      `${capitalize(kind)} ${name} was called as a method`,
    "jack.missingSubroutine": ({ class: cls, subroutine }) =>
      `Class ${cls} doesn't contain a function/constructor ${subroutine}`,
    "jack.undefinedClass": ({ name }) => `Class ${name} doesn't exist`,
    "jack.classNameMismatch": ({ name, file }) =>
      `Class name ${name} doesn't match file name ${file}`,
    "jack.duplicateSubroutine": ({ name }) =>
      `Subroutine ${name} already declared`,
    "jack.missingReturnValue": () =>
      "A non void subroutine must return a value",
    "jack.missingReturnPath": ({ name }) =>
      `Subroutine ${name}: not all code paths return a value`,
  };

/**
 * The English text of a diagnostic, prefixed `Line N: ` when its span has a
 * line.
 */
export function describeEnglish(found: Diagnostic): string {
  const template = ENGLISH[found.code] as (args: unknown) => string;
  const line = found.span?.line;
  return `${line === undefined ? "" : `Line ${line}: `}${template(found.args)}`;
}
