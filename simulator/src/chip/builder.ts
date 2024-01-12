import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  Err,
  isErr,
  isOk,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { ParseError, Span } from "../languages/base.js";
import { HDL, HdlParse, Part, PinParts } from "../languages/hdl.js";
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

export async function build(
  parts: HdlParse,
  fs?: FileSystem,
  name?: string
): Promise<Result<Chip, CompilationError>> {
  return await new ChipBuilder(parts, fs, name).build();
}

interface InternalPin {
  isDefined: boolean;
  firstUse: Span;
}

class ChipBuilder {
  private parts: HdlParse;
  private fs?: FileSystem;
  private expectedName?: string;

  private chip: Chip;
  private internalPins: Map<string, InternalPin> = new Map();
  private inPins: Map<string, Set<number>> = new Map();
  private outPins: Map<string, Set<number>> = new Map();

  public constructor(parts: HdlParse, fs?: FileSystem, name?: string) {
    this.parts = parts;
    this.expectedName = name;
    this.fs = fs;
    this.chip = new Chip(
      parts.ins.map(({ pin, width }) => ({ pin: pin.toString(), width })),
      parts.outs.map(({ pin, width }) => ({ pin: pin.toString(), width })),
      parts.name.value,
      [],
      parts.clocked
    );
  }

  private isConstant(pinName: string): boolean {
    return (
      pinName === "false" ||
      pinName === "true" ||
      pinName === "0" ||
      pinName === "1"
    );
  }

  public async build() {
    if (this.expectedName && this.parts.name.value != this.expectedName) {
      return Err({
        message: `Wrong chip name`,
        span: this.parts.name.span,
      });
    }

    if (this.parts.parts === "BUILTIN") {
      return getBuiltinChip(this.parts.name.value);
    }

    try {
      await this.wireParts();
      return Ok(this.chip);
    } catch (e) {
      return Err(e as CompilationError);
    }
  }

  private async wireParts() {
    if (this.parts.parts === "BUILTIN") {
      return;
    }
    for (const part of this.parts.parts) {
      const builtin = await loadChip(part.name, this.fs);
      if (isErr(builtin)) {
        throw {
          message: `Undefined chip name: ${part.name}`,
          span: part.span,
        };
      }
      const partChip = Ok(builtin);
      if (partChip.name == this.chip.name) {
        throw {
          message: `Cannot use chip ${partChip.name} to implement itself`,
          span: part.span,
        };
      }
      this.wirePart(part, partChip);
    }
    this.validateInternalPins();
  }

  private wirePart(part: Part, partChip: Chip) {
    const wires: Connection[] = [];
    this.inPins.clear();
    for (const { lhs, rhs } of part.wires) {
      this.validateWire(partChip, lhs, rhs);
      wires.push(this.createWire(lhs, rhs));
    }

    this.chip.wire(partChip, wires);
  }

  private createWire(lhs: PinParts, rhs: PinParts): Connection {
    return {
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
    };
  }

  private validateWire(partChip: Chip, lhs: PinParts, rhs: PinParts) {
    if (partChip.isInPin(lhs.pin)) {
      this.validateInputWire(lhs, rhs);
    } else if (partChip.isOutPin(lhs.pin)) {
      this.validateOutputWire(rhs);
    } else {
      throw {
        message: `Undefined input/output pin name: ${lhs.pin}`,
        span: lhs.span,
      };
    }
  }

  private isInternal(pinName: string): boolean {
    return !(
      this.chip.isInPin(pinName) ||
      this.chip.isOutPin(pinName) ||
      this.isConstant(pinName)
    );
  }

  private validateInputWire(lhs: PinParts, rhs: PinParts) {
    this.validateInputSource(rhs);
    this.checkMultipleAssignments(lhs, this.inPins);

    // track internal pin use to detect undefined pins
    if (this.isInternal(rhs.pin)) {
      const pinData = this.internalPins.get(rhs.pin);
      if (pinData == undefined) {
        this.internalPins.set(rhs.pin, {
          isDefined: false,
          firstUse: rhs.span,
        });
      } else {
        pinData.firstUse =
          pinData.firstUse.start < rhs.span.start ? pinData.firstUse : rhs.span;
      }
    }
  }

  private validateOutputWire(rhs: PinParts) {
    this.validateWriteTarget(rhs);

    if (this.chip.isOutPin(rhs.pin)) {
      this.checkMultipleAssignments(rhs, this.outPins);
    } else {
      // rhs is necessarily an internal pin
      if (rhs.start !== undefined || rhs.end !== undefined) {
        throw {
          message: `Cannot write to sub bus of internal pin ${rhs.pin}`,
          span: rhs.span,
        };
      }
      // track internal pin creation to detect undefined pins
      const pinData = this.internalPins.get(rhs.pin);
      if (pinData == undefined) {
        this.internalPins.set(rhs.pin, {
          isDefined: true,
          firstUse: rhs.span,
        });
      } else {
        if (pinData.isDefined) {
          throw {
            message: `Internal pin ${rhs.pin} already defined`,
            span: rhs.span,
          };
        }
        pinData.isDefined = true;
      }
    }
  }

  private validateWriteTarget(rhs: PinParts) {
    if (this.chip.isInPin(rhs.pin)) {
      throw {
        message: `Cannot write to input pin ${rhs.pin}`,
        span: rhs.span,
      };
    }
    if (this.isConstant(rhs.pin)) {
      throw {
        message: `Illegal internal pin name: ${rhs.pin}`,
        span: rhs.span,
      };
    }
  }

  private validateInputSource(rhs: PinParts) {
    if (this.chip.isOutPin(rhs.pin)) {
      throw {
        message: `Cannot use output pin as input`,
        span: rhs.span,
      };
    } else if (!this.chip.isInPin(rhs.pin) && rhs.start != undefined) {
      throw {
        message: this.isConstant(rhs.pin)
          ? `Cannot use sub bus of constant bus`
          : `Cannot use sub bus of internal pin ${rhs.pin} as input`,
        span: rhs.span,
      };
    }
  }

  private getIndices(pin: PinParts): number[] {
    if (pin.start != undefined && pin.end != undefined) {
      const indices = [];
      for (let i = pin.start; i <= pin.end; i++) {
        indices.push(i);
      }
      return indices;
    }
    return [-1];
  }

  private checkMultipleAssignments(
    pin: PinParts,
    assignedIndexes: Map<string, Set<number>>
  ) {
    let errorIndex: number | null = null;
    const indices = assignedIndexes.get(pin.pin);
    if (!indices) {
      assignedIndexes.set(pin.pin, new Set(this.getIndices(pin)));
    } else {
      if (indices.has(-1)) {
        // -1 stands for the whole bus width
        errorIndex = pin.start ?? -1;
      } else if (pin.start !== undefined && pin.end !== undefined) {
        for (const i of this.getIndices(pin)) {
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
      throw {
        message: `Cannot write to pin ${pin.pin}${
          errorIndex != -1 ? `[${errorIndex}]` : ""
        } multiple times`,
        span: pin.span,
      };
    }
  }

  private validateInternalPins() {
    for (const [name, pinData] of this.internalPins) {
      if (!pinData.isDefined) {
        throw {
          message:
            name.toLowerCase() == "true" || name.toLowerCase() == "false"
              ? `The constants ${name.toLowerCase()} must be in lower-case`
              : `Undefined internal pin name: ${name}`,
          span: pinData.firstUse,
        };
      }
    }
  }
}
