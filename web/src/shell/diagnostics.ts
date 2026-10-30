import { i18n } from "@lingui/core";
import { t } from "@lingui/core/macro";
import type { Diagnostic } from "@nand2tetris/simulator/languages/base.js";

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
    case "syntax.expected": {
      const list = listOf(found.args.expected);
      return t`expected ${list}`;
    }

    case "error.unexpected": {
      // A programmer facing message that has no translation.
      return found.args.message;
    }

    case "asm.invalidTarget": {
      const { target, suggestion } = found.args;
      return suggestion === undefined
        ? t`Invalid ASM target: ${target}`
        : t`Invalid ASM target: ${target}. Did you mean ${suggestion}?`;
    }
    case "asm.invalidValue": {
      const { value, suggestion } = found.args;
      return suggestion === undefined
        ? t`Invalid ASM value: ${value}`
        : t`Invalid ASM value: ${value}. Did you mean ${suggestion}?`;
    }
    case "asm.aValueRange": {
      const { value } = found.args;
      return t`${value} is invalid for an A instruction (should be 0 to 32767)`;
    }
    case "asm.duplicateLabel": {
      const { label } = found.args;
      return t`Duplicate label ${label}`;
    }

    case "tst.missingLoad":
      return t`A test script must have a load command`;

    case "chip.busRange":
      return t`Bus start index should be less than or equal to bus end index`;
    case "chip.notLoaded": {
      const { file } = found.args;
      return t`Could not load chip ${file}`;
    }
    case "chip.multipleWrites": {
      const { pin, index } = found.args;
      return index === undefined
        ? t`Cannot write to pin ${pin} multiple times`
        : t`Cannot write to pin ${pin}[${index}] multiple times`;
    }
    case "chip.wrongName":
      return t`Wrong chip name`;
    case "chip.notBuiltin": {
      const { name } = found.args;
      return t`Chip ${name} not in builtin registry`;
    }
    case "chip.notFound": {
      const { name } = found.args;
      return t`Undefined chip name: ${name}`;
    }
    case "chip.selfReference": {
      const { name } = found.args;
      return t`Cannot use chip ${name} to implement itself`;
    }
    case "chip.loopingWire": {
      const { pin } = found.args;
      return t`Looping wire ${pin}`;
    }
    case "chip.undefinedPin": {
      const { pin } = found.args;
      return t`Undefined pin name: ${pin}`;
    }
    case "chip.internalPinSubscripted": {
      const { pin } = found.args;
      return t`Internal pins (in this case: ${pin}) cannot be subscripted or indexed`;
    }
    case "chip.internalPinRedefined": {
      const { pin } = found.args;
      return t`Internal pin ${pin} already defined`;
    }
    case "chip.writeToInput": {
      const { pin } = found.args;
      return t`Cannot write to input pin ${pin}`;
    }
    case "chip.internalPinReserved":
      return t`Internal pin name cannot be "true" or "false"`;
    case "chip.outputAsInput":
      return t`Cannot use output pin as input`;
    case "chip.constantSubscripted":
      return t`Constant bus cannot be subscripted or indexed`;
    case "chip.constantCase": {
      const { name } = found.args;
      return t`The constant bus ${name} must be in lower-case`;
    }
    case "chip.undefinedInternalPin": {
      const { name } = found.args;
      return t`Undefined internal pin name: ${name}`;
    }
    case "chip.busWidthMismatch": {
      const { lhs, rhs } = found.args;
      // An unknown width reads as `undefined`, as in the English table.
      const lhsWidth = String(found.args.lhsWidth);
      const rhsWidth = String(found.args.rhsWidth);
      return t`Different bus widths: ${lhs}(${lhsWidth}) and ${rhs}(${rhsWidth})`;
    }
    case "chip.constantBusTarget":
      return t`Cannot wire to constant bus`;
    case "chip.subBusRange": {
      const { pin, width } = found.args;
      return t`Sub-bus index out of range (${pin} has width ${width})`;
    }
    case "chip.circularPins":
      return t`Circular pin dependency`;

    case "vm.illegalSubroutineName": {
      const { name } = found.args;
      return t`Illegal subroutine name ${name} (Expected <className>.<SubroutineName>)`;
    }
    case "vm.fileNameMismatch": {
      const { file, className, name } = found.args;
      return t`File name ${file} doesn't match class name ${className} (at ${name})`;
    }
    case "vm.duplicateFile": {
      const { file } = found.args;
      return t`File ${file} already exists`;
    }
    case "vm.illegalLocalCount": {
      const { count } = found.args;
      return t`Illegal number of local variables ${count} (Expected 0-32767)`;
    }
    case "vm.illegalArgCount": {
      const { count } = found.args;
      return t`Illegal number of arguments ${count} (Expected 0-32767)`;
    }
    case "vm.osArgCount": {
      const { name, expected, received } = found.args;
      return t`OS function ${name} expects ${expected} arguments, not ${received}`;
    }
    case "vm.undefinedFunction": {
      const { name } = found.args;
      return t`Undefined function ${name}`;
    }
    case "vm.noFiles":
      return t`No .vm files to load. Compile your Jack files first.`;
    case "vm.duplicateLabel": {
      const { label, line } = found.args;
      const fn = found.args.function;
      return t`Cannot redeclare label ${label} in function ${fn} (previously at line ${line})`;
    }
    case "vm.undeclaredLabel": {
      const { label } = found.args;
      return t`Undeclared label ${label}`;
    }
    case "vm.duplicateFunction": {
      const { name } = found.args;
      return t`VM Already has a function named ${name}`;
    }
    case "vm.bootstrapAndImplicit":
      return t`Cannot use both bootstrap and an implicit function`;
    case "vm.noEntryPoint":
      return t`Could not determine an entry point for VM`;
    case "vm.illegalOffset": {
      const { offset } = found.args;
      return t`Illegal offset value ${offset} (must be between 0 and 32767)`;
    }
    case "vm.pointerOutOfBounds": {
      const { offset } = found.args;
      return t`pointer out of bounds access (pointer can be 0 for this, 1 for that, but got ${offset}`;
    }
    case "vm.staticOutOfBounds": {
      const { offset } = found.args;
      return t`Cannot access statics beyond 239: ${offset}`;
    }
    case "vm.tempOutOfBounds": {
      const { offset } = found.args;
      return t`Temp out of bounds access (temp can be 0 to 7, but got ${offset}`;
    }

    case "jack.undeclaredVariable": {
      const { name } = found.args;
      return t`Undeclared variable ${name}`;
    }
    case "jack.unknownType": {
      const { type } = found.args;
      return t`Unknown type ${type}`;
    }
    case "jack.osInterface": {
      const { subroutine, signature } = found.args;
      const className = found.args.class;
      return t`OS subroutine ${className}.${subroutine} must follow the interface ${signature})`;
    }
    case "jack.argCount": {
      const { name, expected, received } = found.args;
      return t`${name} expected ${expected} arguments, got ${received}`;
    }
    case "jack.methodCalledAsFunction": {
      const { name } = found.args;
      return t`Method ${name} was called as a function/constructor`;
    }
    case "jack.calledAsMethod": {
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
    case "jack.missingSubroutine": {
      const { subroutine } = found.args;
      const className = found.args.class;
      return t`Class ${className} doesn't contain a function/constructor ${subroutine}`;
    }
    case "jack.undefinedClass": {
      const { name } = found.args;
      return t`Class ${name} doesn't exist`;
    }
    case "jack.classNameMismatch": {
      const { name, file } = found.args;
      return t`Class name ${name} doesn't match file name ${file}`;
    }
    case "jack.duplicateClassFile": {
      const { path, other } = found.args;
      return t`${path} repeats the class file ${other}`;
    }
    case "jack.duplicateSubroutine": {
      const { name } = found.args;
      return t`Subroutine ${name} already declared`;
    }
    case "jack.missingReturnValue":
      return t`A non void subroutine must return a value`;
    case "jack.missingReturnPath": {
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
