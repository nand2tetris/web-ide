import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import {
  type Diagnostic,
  DiagnosticCode,
  describeDiagnostic as describeInEnglish,
} from "@nand2tetris/simulator/languages/diagnostic.js";

/** The expectations of a failed match as a list in the active locale: `a, b, or c`. */
function listOf(items: readonly string[]): string {
  return new Intl.ListFormat(i18n.locale, {
    style: "long",
    type: "disjunction",
  }).format(items);
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** The text of a diagnostic without its line. */
function messageOf(found: Diagnostic): string {
  switch (found.code) {
    case DiagnosticCode.Syntax.EXPECTED: {
      const list = listOf(found.args.expected);
      return t`expected ${list}`;
    }

    case DiagnosticCode.Error.UNEXPECTED: {
      // A programmer facing message that has no translation.
      return found.args.message;
    }

    case DiagnosticCode.Asm.INVALID_TARGET: {
      const { target, suggestion } = found.args;
      return suggestion === undefined
        ? t`Invalid ASM target: ${target}`
        : t`Invalid ASM target: ${target}. Did you mean ${suggestion}?`;
    }
    case DiagnosticCode.Asm.INVALID_VALUE: {
      const { value, suggestion } = found.args;
      return suggestion === undefined
        ? t`Invalid ASM value: ${value}`
        : t`Invalid ASM value: ${value}. Did you mean ${suggestion}?`;
    }
    case DiagnosticCode.Asm.A_VALUE_RANGE: {
      const { value } = found.args;
      return t`${value} is invalid for an A instruction (should be 0 to 32767)`;
    }
    case DiagnosticCode.Asm.DUPLICATE_LABEL: {
      const { label } = found.args;
      return t`Duplicate label ${label}`;
    }

    case DiagnosticCode.Tst.MISSING_LOAD:
      return t`A test script must have a load command`;

    case DiagnosticCode.Chip.BUS_RANGE:
      return t`Bus start index should be less than or equal to bus end index`;
    case DiagnosticCode.Chip.NOT_LOADED: {
      const { file } = found.args;
      return t`Could not load chip ${file}`;
    }
    case DiagnosticCode.Chip.MULTIPLE_WRITES: {
      const { pin, index } = found.args;
      return index === undefined
        ? t`Cannot write to pin ${pin} multiple times`
        : t`Cannot write to pin ${pin}[${index}] multiple times`;
    }
    case DiagnosticCode.Chip.WRONG_NAME:
      return t`Wrong chip name`;
    case DiagnosticCode.Chip.NOT_BUILTIN: {
      const { name } = found.args;
      return t`Chip ${name} not in builtin registry`;
    }
    case DiagnosticCode.Chip.NOT_FOUND: {
      const { name } = found.args;
      return t`Undefined chip name: ${name}`;
    }
    case DiagnosticCode.Chip.SELF_REFERENCE: {
      const { name } = found.args;
      return t`Cannot use chip ${name} to implement itself`;
    }
    case DiagnosticCode.Chip.LOOPING_WIRE: {
      const { pin } = found.args;
      return t`Looping wire ${pin}`;
    }
    case DiagnosticCode.Chip.UNDEFINED_PIN: {
      const { pin } = found.args;
      return t`Undefined pin name: ${pin}`;
    }
    case DiagnosticCode.Chip.INTERNAL_PIN_SUBSCRIPTED: {
      const { pin } = found.args;
      return t`Internal pins (in this case: ${pin}) cannot be subscripted or indexed`;
    }
    case DiagnosticCode.Chip.INTERNAL_PIN_REDEFINED: {
      const { pin } = found.args;
      return t`Internal pin ${pin} already defined`;
    }
    case DiagnosticCode.Chip.WRITE_TO_INPUT: {
      const { pin } = found.args;
      return t`Cannot write to input pin ${pin}`;
    }
    case DiagnosticCode.Chip.INTERNAL_PIN_RESERVED:
      return t`Internal pin name cannot be "true" or "false"`;
    case DiagnosticCode.Chip.OUTPUT_AS_INPUT:
      return t`Cannot use output pin as input`;
    case DiagnosticCode.Chip.CONSTANT_SUBSCRIPTED:
      return t`Constant bus cannot be subscripted or indexed`;
    case DiagnosticCode.Chip.CONSTANT_CASE: {
      const { name } = found.args;
      return t`The constant bus ${name} must be in lower-case`;
    }
    case DiagnosticCode.Chip.UNDEFINED_INTERNAL_PIN: {
      const { name } = found.args;
      return t`Undefined internal pin name: ${name}`;
    }
    case DiagnosticCode.Chip.BUS_WIDTH_MISMATCH: {
      const { lhs, rhs } = found.args;
      // An unknown width reads as `undefined`, as in the English table.
      const lhsWidth = String(found.args.lhsWidth);
      const rhsWidth = String(found.args.rhsWidth);
      return t`Different bus widths: ${lhs}(${lhsWidth}) and ${rhs}(${rhsWidth})`;
    }
    case DiagnosticCode.Chip.CONSTANT_BUS_TARGET:
      return t`Cannot wire to constant bus`;
    case DiagnosticCode.Chip.SUB_BUS_RANGE: {
      const { pin, width } = found.args;
      return t`Sub-bus index out of range (${pin} has width ${width})`;
    }
    case DiagnosticCode.Chip.CIRCULAR_PINS:
      return t`Circular pin dependency`;

    case DiagnosticCode.Vm.ILLEGAL_SUBROUTINE_NAME: {
      const { name } = found.args;
      return t`Illegal subroutine name ${name} (Expected <className>.<SubroutineName>)`;
    }
    case DiagnosticCode.Vm.FILE_NAME_MISMATCH: {
      const { file, className, name } = found.args;
      return t`File name ${file} doesn't match class name ${className} (at ${name})`;
    }
    case DiagnosticCode.Vm.DUPLICATE_FILE: {
      const { file } = found.args;
      return t`File ${file} already exists`;
    }
    case DiagnosticCode.Vm.ILLEGAL_LOCAL_COUNT: {
      const { count } = found.args;
      return t`Illegal number of local variables ${count} (Expected 0-32767)`;
    }
    case DiagnosticCode.Vm.ILLEGAL_ARG_COUNT: {
      const { count } = found.args;
      return t`Illegal number of arguments ${count} (Expected 0-32767)`;
    }
    case DiagnosticCode.Vm.OS_ARG_COUNT: {
      const { name, expected, received } = found.args;
      return t`OS function ${name} expects ${expected} arguments, not ${received}`;
    }
    case DiagnosticCode.Vm.UNDEFINED_FUNCTION: {
      const { name } = found.args;
      return t`Undefined function ${name}`;
    }
    case DiagnosticCode.Vm.NO_FILES:
      return t`No .vm files to load. Compile your Jack files first.`;
    case DiagnosticCode.Vm.DUPLICATE_LABEL: {
      const { label, line } = found.args;
      const fn = found.args.function;
      return t`Cannot redeclare label ${label} in function ${fn} (previously at line ${line})`;
    }
    case DiagnosticCode.Vm.UNDECLARED_LABEL: {
      const { label } = found.args;
      return t`Undeclared label ${label}`;
    }
    case DiagnosticCode.Vm.DUPLICATE_FUNCTION: {
      const { name } = found.args;
      return t`VM Already has a function named ${name}`;
    }
    case DiagnosticCode.Vm.BOOTSTRAP_AND_IMPLICIT:
      return t`Cannot use both bootstrap and an implicit function`;
    case DiagnosticCode.Vm.NO_ENTRY_POINT:
      return t`Could not determine an entry point for VM`;
    case DiagnosticCode.Vm.ILLEGAL_OFFSET: {
      const { offset } = found.args;
      return t`Illegal offset value ${offset} (must be between 0 and 32767)`;
    }
    case DiagnosticCode.Vm.POINTER_OUT_OF_BOUNDS: {
      const { offset } = found.args;
      return t`pointer out of bounds access (pointer can be 0 for this, 1 for that, but got ${offset}`;
    }
    case DiagnosticCode.Vm.STATIC_OUT_OF_BOUNDS: {
      const { offset } = found.args;
      return t`Cannot access statics beyond 239: ${offset}`;
    }
    case DiagnosticCode.Vm.TEMP_OUT_OF_BOUNDS: {
      const { offset } = found.args;
      return t`Temp out of bounds access (temp can be 0 to 7, but got ${offset}`;
    }

    case DiagnosticCode.Jack.UNDECLARED_VARIABLE: {
      const { name } = found.args;
      return t`Undeclared variable ${name}`;
    }
    case DiagnosticCode.Jack.UNKNOWN_TYPE: {
      const { type } = found.args;
      return t`Unknown type ${type}`;
    }
    case DiagnosticCode.Jack.OS_INTERFACE: {
      const { subroutine, signature } = found.args;
      const className = found.args.class;
      return t`OS subroutine ${className}.${subroutine} must follow the interface ${signature})`;
    }
    case DiagnosticCode.Jack.ARG_COUNT: {
      const { name, expected, received } = found.args;
      return t`${name} expected ${expected} arguments, got ${received}`;
    }
    case DiagnosticCode.Jack.METHOD_CALLED_AS_FUNCTION: {
      const { name } = found.args;
      return t`Method ${name} was called as a function/constructor`;
    }
    case DiagnosticCode.Jack.CALLED_AS_METHOD: {
      const { kind, name } = found.args;
      switch (kind) {
        case "function":
          return t`Function ${name} was called as a method`;
        case "constructor":
          return t`Constructor ${name} was called as a method`;
        default: {
          const word = capitalize(kind);
          return t`${word} ${name} was called as a method`;
        }
      }
    }
    case DiagnosticCode.Jack.MISSING_SUBROUTINE: {
      const { subroutine } = found.args;
      const className = found.args.class;
      return t`Class ${className} doesn't contain a function/constructor ${subroutine}`;
    }
    case DiagnosticCode.Jack.UNDEFINED_CLASS: {
      const { name } = found.args;
      return t`Class ${name} doesn't exist`;
    }
    case DiagnosticCode.Jack.CLASS_NAME_MISMATCH: {
      const { name, file } = found.args;
      return t`Class name ${name} doesn't match file name ${file}`;
    }
    case DiagnosticCode.Jack.DUPLICATE_CLASS_FILE:
      return describeInEnglish({ code: found.code, args: found.args });
    case DiagnosticCode.Jack.DUPLICATE_SUBROUTINE: {
      const { name } = found.args;
      return t`Subroutine ${name} already declared`;
    }
    case DiagnosticCode.Jack.MISSING_RETURN_VALUE:
      return t`A non void subroutine must return a value`;
    case DiagnosticCode.Jack.MISSING_RETURN_PATH: {
      const { name } = found.args;
      return t`Subroutine ${name}: not all code paths return a value`;
    }

    default: {
      // A code without a case above makes `found` not `never`, which fails to compile.
      const unhandled: never = found;
      return unhandled;
    }
  }
}

/**
 * The text of a diagnostic in the active locale, prefixed with its line when
 * its span has one.
 */
export function describeDiagnostic(found: Diagnostic): string {
  const message = messageOf(found);
  const line = found.span?.line;
  return line === undefined ? message : t`Line ${line}: ${message}`;
}
