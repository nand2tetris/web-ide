import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  Err,
  isErr,
  isOk,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { ParseError, Span } from "../languages/base.js";
import { HDL, HdlParse, PinParts } from "../languages/hdl.js";
import { getBuiltinChip, hasBuiltinChip } from "./builtins/index.js";
import { Chip, Connection } from "./chip.js";

const UNKNOWN_HDL_ERROR = `HDL statement has a syntax error`;

function pinWidth(start: number, end: number | undefined): number | undefined {
  if (end === undefined) {
    return undefined;
  }
  if (end >= start) {
    return end - start + 1;
  }
  if (start > 0 && end === 0) {
    return 1;
  }
  throw new Error(`Bus specification has start > end (${start} > ${end})`);
}

export interface CompilationError {
  message: string;
  span?: Span;
}

function parseErrorToCompilationError(error: ParseError) {
  if (!error.message) {
    return { message: UNKNOWN_HDL_ERROR, span: error.span };
  }
  const match = error.message.match(/Line \d+, col \d+: (?<message>.*)/);
  if (match?.groups?.message !== undefined) {
    return { message: match.groups.message, span: error.span };
  }
  return { message: error.message, span: error.span };
}

export async function parse(
  code: string,
  name?: string
): Promise<Result<Chip, CompilationError>> {
  const parsed = HDL.parse(code.toString());
  if (isErr(parsed)) {
    return Err(parseErrorToCompilationError(Err(parsed)));
  }
  return build(Ok(parsed), undefined, name);
}

export async function loadChip(
  name: string,
  fs?: FileSystem
): Promise<Result<Chip>> {
  if (hasBuiltinChip(name) || fs === undefined) {
    return getBuiltinChip(name);
  }
  try {
    const file = await fs.readFile(`${name}.hdl`);
    const maybeParsedHDL = HDL.parse(file);

    let maybeChip: Result<Chip, Error>;
    if (isOk(maybeParsedHDL)) {
      const maybeBuilt = await build(Ok(maybeParsedHDL), fs);
      if (isErr(maybeBuilt)) {
        maybeChip = Err(new Error(Err(maybeBuilt).message));
      } else {
        maybeChip = maybeBuilt;
      }
    } else {
      maybeChip = Err(new Error("HDL Was not parsed"));
    }

    return maybeChip;
  } catch (e) {
    return Err(new Error(`Could not load chip ${name}.hdl` /*, { cause: e }*/));
  }
}

function isConstant(pinName: string): boolean {
  return (
    pinName === "false" ||
    pinName === "true" ||
    pinName === "0" ||
    pinName === "1"
  );
}

interface InternalPin {
  isDefined: boolean;
  firstUse: Span;
}

function getIndices(pin: PinParts): number[] {
  if (pin.start != undefined && pin.end != undefined) {
    const indices = [];
    for (let i = pin.start; i <= pin.end; i++) {
      indices.push(i);
    }
    return indices;
  }
  return [-1];
}

// returns the index that has been assigned multiple times if one exists
function checkMultipleAssignments(
  pin: PinParts,
  assignedIndexes: Map<string, Set<number>>
): Result<boolean, CompilationError> {
  let errorIndex: number | null = null;
  const indices = assignedIndexes.get(pin.pin);
  if (!indices) {
    assignedIndexes.set(pin.pin, new Set(getIndices(pin)));
  } else {
    if (indices.has(-1)) {
      // -1 stands for the whole bus width
      errorIndex = pin.start ?? -1;
    } else if (pin.start !== undefined && pin.end !== undefined) {
      for (const i of getIndices(pin)) {
        if (indices.has(i)) {
          errorIndex = i;
        }
        indices.add(i);
      }
    } else {
      indices.add(-1);
    }
  }
  if (errorIndex != null) {
    return Err({
      message: `Cannot write to pin ${pin.pin}${
        errorIndex != -1 ? `[${errorIndex}]` : ""
      } multiple times`,
      span: pin.span,
    });
  }
  return Ok(true);
}

function checkBadInputSource(
  rhs: PinParts,
  buildChip: Chip
): Result<boolean, CompilationError> {
  if (buildChip.isOutPin(rhs.pin)) {
    return Err({
      message: `Cannot use output pin as input`,
      span: rhs.span,
    });
  } else if (!buildChip.isInPin(rhs.pin) && rhs.start != undefined) {
    return Err({
      message: isConstant(rhs.pin)
        ? `Cannot use sub bus of constant bus`
        : `Cannot use sub bus of internal pin ${rhs.pin} as input`,
      span: rhs.span,
    });
  }
  return Ok(true);
}

function checkBadWriteTarget(
  rhs: PinParts,
  buildChip: Chip
): Result<boolean, CompilationError> {
  if (buildChip.isInPin(rhs.pin)) {
    return Err({
      message: `Cannot write to input pin ${rhs.pin}`,
      span: rhs.span,
    });
  }
  if (isConstant(rhs.pin)) {
    return Err({
      message: `Cannot write to constant bus`,
      span: rhs.span,
    });
  }
  return Ok(true);
}

export async function build(
  parts: HdlParse,
  fs?: FileSystem,
  name?: string
): Promise<Result<Chip, CompilationError>> {
  if (name && parts.name.value != name) {
    return Err({
      message: `Wrong chip name`,
      span: parts.name.span,
    });
  }

  if (parts.parts === "BUILTIN") {
    return getBuiltinChip(parts.name.value);
  }

  const buildChip = new Chip(
    parts.ins.map(({ pin, width }) => ({ pin: pin.toString(), width })),
    parts.outs.map(({ pin, width }) => ({ pin: pin.toString(), width })),
    parts.name.value,
    [],
    parts.clocked
  );

  const internalPins: Map<string, InternalPin> = new Map();
  const outPins: Map<string, Set<number>> = new Map();

  for (const part of parts.parts) {
    const builtin = await loadChip(part.name, fs);
    if (isErr(builtin)) {
      return Err({
        message: `Undefined chip name: ${part.name}`,
        span: part.span,
      });
    }
    const partChip = Ok(builtin);

    if (partChip.name == buildChip.name) {
      return Err({
        message: `Cannot use chip ${partChip.name} to implement itself`,
        span: part.span,
      });
    }

    const wires: Connection[] = [];
    const inPins: Map<string, Set<number>> = new Map();
    for (const { lhs, rhs } of part.wires) {
      const isRhsInternal = !(
        buildChip.isInPin(rhs.pin) ||
        buildChip.isOutPin(rhs.pin) ||
        isConstant(rhs.pin)
      );

      if (partChip.isInPin(lhs.pin)) {
        // inputting from rhs to chip input
        let result = checkMultipleAssignments(lhs, inPins);
        if (isErr(result)) {
          return result;
        }

        result = checkBadInputSource(rhs, buildChip);
        if (isErr(result)) {
          return result;
        }

        // track internal pin use to detect undefined pins
        if (isRhsInternal) {
          const pinData = internalPins.get(rhs.pin);
          if (pinData == undefined) {
            internalPins.set(rhs.pin, {
              isDefined: false,
              firstUse: rhs.span,
            });
          } else {
            pinData.firstUse =
              pinData.firstUse.start < rhs.span.start
                ? pinData.firstUse
                : rhs.span;
          }
        }
      } else if (partChip.isOutPin(lhs.pin)) {
        // inputting from chip output to rhs
        const result = checkBadWriteTarget(rhs, buildChip);
        if (isErr(result)) {
          return result;
        }

        if (buildChip.isOutPin(rhs.pin)) {
          const result = checkMultipleAssignments(rhs, outPins);
          if (isErr(result)) {
            return result;
          }
        } else {
          // rhs is necessarily an internal pin
          if (rhs.start !== undefined || rhs.end !== undefined) {
            return Err({
              message: `Cannot write to sub bus of internal pin ${rhs.pin}`,
              span: rhs.span,
            });
          }
          // track internal pin creation to detect undefined pins
          const pinData = internalPins.get(rhs.pin);
          if (pinData == undefined) {
            internalPins.set(rhs.pin, {
              isDefined: true,
              firstUse: rhs.span,
            });
          } else {
            if (pinData.isDefined) {
              return Err({
                message: buildChip.isOutPin(rhs.pin)
                  ? `Cannot write to output pin ${rhs.pin} multiple times`
                  : `Internal pin ${rhs.pin} already defined`,
                span: rhs.span,
              });
            }
            pinData.isDefined = true;
          }
        }
      } else {
        return Err({
          message: `Undefined input/output pin name: ${lhs.pin}`,
          span: lhs.span,
        });
      }

      wires.push({
        to: {
          name: lhs.pin.toString(),
          start: lhs.start ?? 0,
          width: pinWidth(lhs.start ?? 0, lhs.end),
        },
        from: {
          name: rhs.pin.toString(),
          start: rhs.start ?? 0,
          width: pinWidth(rhs.start ?? 0, rhs.end),
        },
      });
    }

    try {
      buildChip.wire(partChip, wires);
    } catch (e) {
      return Err(e as Error);
    }
  }

  for (const [name, pinData] of internalPins) {
    let message = `Undefined internal pin name: ${name}`;
    if (name.toLowerCase() == "true" || name.toLowerCase() == "false") {
      message = `The constants ${name.toLowerCase()} must be in lower-case`;
    }
    if (!pinData.isDefined) {
      return Err({
        message: message,
        span: pinData.firstUse,
      });
    }
  }

  return Ok(buildChip);
}
