import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  Err,
  isErr,
  isOk,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { ParseError, Span } from "../languages/base.js";
import { HDL, HdlParse } from "../languages/hdl.js";
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
  const match = error.message.match(
    /Line \d+, col \d+: (?<message>.*)/
  );
  if (!match || !match.groups) {
    return { message: error.message, span: error.span };
  }
  const { message } = match.groups;
  return { message, span: error.span };
}

export async function parse(
  code: string
): Promise<Result<Chip, CompilationError>> {
  const parsed = HDL.parse(code.toString());
  if (isErr(parsed)) {
    return Err(parseErrorToCompilationError(Err(parsed)));
  }
  return build(Ok(parsed));
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
    pinName.toLowerCase() === "false" ||
    pinName.toLowerCase() === "true" ||
    pinName === "0" ||
    pinName === "1"
  );
}

interface InternalPin {
  isDefined: boolean;
  firstUse: Span;
}

export async function build(
  parts: HdlParse,
  fs?: FileSystem
): Promise<Result<Chip, CompilationError>> {
  if (parts.parts === "BUILTIN") {
    return getBuiltinChip(parts.name.toString());
  }

  const buildChip = new Chip(
    parts.ins.map(({ pin, width }) => ({ pin: pin.toString(), width })),
    parts.outs.map(({ pin, width }) => ({ pin: pin.toString(), width })),
    parts.name.toString(),
    [],
    parts.clocked
  );

  const internalPins: Map<string, InternalPin> = new Map();

  for (const part of parts.parts) {
    const builtin = await loadChip(part.name.toString(), fs);
    if (isErr(builtin)) {
      return Err({
        message: `Undefined chip name: ${part.name}`,
        span: part.span,
      });
    }
    const partChip = Ok(builtin);

    const wires: Connection[] = [];
    for (const { lhs, rhs } of part.wires) {
      const isRhsInternal = !(
        buildChip.isInPin(rhs.pin) ||
        buildChip.isOutPin(rhs.pin) ||
        isConstant(rhs.pin)
      );

      if (partChip.isInPin(lhs.pin)) {
        if (isRhsInternal) {
          // internal pin is being used
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
        if (isRhsInternal) {
          // internal pin is being defined
          const pinData = internalPins.get(rhs.pin);
          if (pinData == undefined) {
            internalPins.set(rhs.pin, {
              isDefined: true,
              firstUse: rhs.span,
            });
          } else {
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
    if (!pinData.isDefined) {
      return Err({
        message: `Undefined internal pin name: ${name}`,
        span: pinData.firstUse,
      });
    }
  }

  return Ok(buildChip);
}
