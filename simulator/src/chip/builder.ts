import { FileSystem } from "@davidsouther/jiffies/lib/esm/fs.js";
import {
  Err,
  isErr,
  isOk,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { CompilationError, createError, Span } from "../languages/base.js";
import { HDL, HdlParse, Part, PinParts } from "../languages/hdl.js";
import { getBuiltinChip, hasBuiltinChip } from "./builtins/index.js";
import { Chip, Connection } from "./chip.js";

function pinWidth(pin: PinParts): Result<number | undefined, CompilationError> {
  const start = pin.start ?? 0;
  if (pin.end === undefined) {
    return Ok(undefined);
  }
  if (pin.end >= start) {
    return Ok(pin.end - start + 1);
  }
  return Err(
    createError(
      `Bus start index should be less than or equal to bus end index`,
      pin.span
    )
  );
}

export async function parse(
  code: string,
  name?: string
): Promise<Result<Chip, CompilationError>> {
  const parsed = HDL.parse(code.toString());
  if (isErr(parsed)) {
    return parsed;
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
  width?: number;
}

interface WireData {
  partChip: Chip;
  lhs: PinParts;
  rhs: PinParts;
}

function isConstant(pinName: string): boolean {
  return (
    pinName === "false" ||
    pinName === "true" ||
    pinName === "0" ||
    pinName === "1"
  );
}

function getSubBusWidth(pin: PinParts): number | undefined {
  if (pin.start != undefined && pin.end != undefined) {
    return pin.end - pin.start + 1;
  }
  return undefined;
}

function display(pin: PinParts): string {
  if (pin.start != undefined && pin.end != undefined) {
    return `${pin.pin}[${pin.start}..${pin.end}]`;
  }
  return pin.pin;
}

function createConnection(
  lhs: PinParts,
  rhs: PinParts
): Result<Connection, CompilationError> {
  const lhsWidth = pinWidth(lhs);
  const rhsWidth = pinWidth(rhs);
  if (isErr(lhsWidth)) {
    return lhsWidth;
  }
  if (isErr(rhsWidth)) {
    return rhsWidth;
  }

  return Ok({
    to: {
      name: lhs.pin.toString(),
      start: lhs.start ?? 0,
      width: Ok(lhsWidth),
    },
    from: {
      name: rhs.pin.toString(),
      start: rhs.start ?? 0,
      width: Ok(rhsWidth),
    },
  });
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

function checkMultipleAssignments(
  pin: PinParts,
  assignedIndexes: Map<string, Set<number>>
): Result<void, CompilationError> {
  let errorIndex: number | undefined = undefined; // -1 stands for the whole bus width
  const indices = assignedIndexes.get(pin.pin);
  if (!indices) {
    assignedIndexes.set(pin.pin, new Set(getIndices(pin)));
  } else {
    if (indices.has(-1)) {
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
  if (errorIndex != undefined) {
    return Err(
      createError(
        `Cannot write to pin ${pin.pin}${
          errorIndex != -1 ? `[${errorIndex}]` : ""
        } multiple times`,
        pin.span
      )
    );
  }
  return Ok();
}

class ChipBuilder {
  private parts: HdlParse;
  private fs?: FileSystem;
  private expectedName?: string;

  private chip: Chip;
  private internalPins: Map<string, InternalPin> = new Map();
  private inPins: Map<string, Set<number>> = new Map();
  private outPins: Map<string, Set<number>> = new Map();
  private wires: WireData[] = [];

  constructor(parts: HdlParse, fs?: FileSystem, name?: string) {
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

  async build() {
    if (this.expectedName && this.parts.name.value != this.expectedName) {
      return Err(createError(`Wrong chip name`, this.parts.name.span));
    }

    if (this.parts.parts === "BUILTIN") {
      return getBuiltinChip(this.parts.name.value);
    }

    const result = await this.wireParts();
    if (isErr(result)) {
      return result;
    }
    return Ok(this.chip);
  }

  private async wireParts(): Promise<Result<void, CompilationError>> {
    if (this.parts.parts === "BUILTIN") {
      return Ok();
    }
    for (const part of this.parts.parts) {
      const builtin = await loadChip(part.name, this.fs);
      if (isErr(builtin)) {
        return Err(createError(`Undefined chip name: ${part.name}`, part.span));
      }
      const partChip = Ok(builtin);
      if (partChip.name == this.chip.name) {
        return Err(
          createError(
            `Cannot use chip ${partChip.name} to implement itself`,
            part.span
          )
        );
      }
      const result = this.wirePart(part, partChip);
      if (isErr(result)) {
        return result;
      }
    }
    let result = this.validateInternalPins();
    if (isErr(result)) {
      return result;
    }
    // We need to check this at the end because during wiring we might not know the width of some internal pins
    result = this.validateWireWidths();
    if (isErr(result)) {
      return result;
    }
    return Ok();
  }

  private wirePart(part: Part, partChip: Chip): Result<void, CompilationError> {
    const connections: Connection[] = [];
    this.inPins.clear();
    for (const { lhs, rhs } of part.wires) {
      const result = this.validateWire(partChip, lhs, rhs);
      if (isErr(result)) {
        return result;
      }
      const connection = createConnection(lhs, rhs);
      if (isErr(connection)) {
        return connection;
      }
      connections.push(Ok(connection));
    }

    try {
      const result = this.chip.wire(partChip, connections);
      if (isErr(result)) {
        const error = Err(result);
        return Err(
          createError(
            error.message,
            error.lhs
              ? part.wires[error.wireIndex].lhs.span
              : part.wires[error.wireIndex].rhs.span
          )
        );
      }
      return Ok();
    } catch (e) {
      return Err(createError((e as Error).message, part.span));
    }
  }

  private validateWire(
    partChip: Chip,
    lhs: PinParts,
    rhs: PinParts
  ): Result<void, CompilationError> {
    if (partChip.isInPin(lhs.pin)) {
      const result = this.validateInputWire(lhs, rhs);
      if (isErr(result)) {
        return result;
      }
    } else if (partChip.isOutPin(lhs.pin)) {
      const result = this.validateOutputWire(partChip, lhs, rhs);
      if (isErr(result)) {
        return result;
      }
    } else {
      return Err(
        createError(`Undefined input/output pin name: ${lhs.pin}`, lhs.span)
      );
    }
    if (!isConstant(rhs.pin)) {
      this.wires.push({ partChip: partChip, lhs, rhs });
    }
    return Ok();
  }

  private isInternal(pinName: string): boolean {
    return !(
      this.chip.isInPin(pinName) ||
      this.chip.isOutPin(pinName) ||
      isConstant(pinName)
    );
  }

  private validateInputWire(
    lhs: PinParts,
    rhs: PinParts
  ): Result<void, CompilationError> {
    let result = this.validateInputSource(rhs);
    if (isErr(result)) {
      return result;
    }
    result = checkMultipleAssignments(lhs, this.inPins);
    if (isErr(result)) {
      return result;
    }

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
    return Ok();
  }

  private validateOutputWire(
    partChip: Chip,
    lhs: PinParts,
    rhs: PinParts
  ): Result<void, CompilationError> {
    let result = this.validateWriteTarget(rhs);
    if (isErr(result)) {
      return result;
    }

    if (this.chip.isOutPin(rhs.pin)) {
      result = checkMultipleAssignments(rhs, this.outPins);
      if (isErr(result)) {
        return result;
      }
    } else {
      // rhs is necessarily an internal pin
      if (rhs.start !== undefined || rhs.end !== undefined) {
        return Err(
          createError(
            `Cannot write to sub bus of internal pin ${rhs.pin}`,
            rhs.span
          )
        );
      }
      // track internal pin creation to detect undefined pins
      const pinData = this.internalPins.get(rhs.pin);
      const width = getSubBusWidth(lhs) ?? partChip.get(lhs.pin)?.width;
      if (pinData == undefined) {
        this.internalPins.set(rhs.pin, {
          isDefined: true,
          firstUse: rhs.span,
          width,
        });
      } else {
        if (pinData.isDefined) {
          return Err(
            createError(`Internal pin ${rhs.pin} already defined`, rhs.span)
          );
        }
        pinData.isDefined = true;
        pinData.width = width;
      }
    }
    return Ok();
  }

  private validateWriteTarget(rhs: PinParts): Result<void, CompilationError> {
    if (this.chip.isInPin(rhs.pin)) {
      return Err(createError(`Cannot write to input pin ${rhs.pin}`, rhs.span));
    }
    if (isConstant(rhs.pin)) {
      return Err(
        createError(`Illegal internal pin name: ${rhs.pin}`, rhs.span)
      );
    }
    return Ok();
  }

  private validateInputSource(rhs: PinParts): Result<void, CompilationError> {
    if (this.chip.isOutPin(rhs.pin)) {
      return Err(createError(`Cannot use output pin as input`, rhs.span));
    } else if (!this.chip.isInPin(rhs.pin) && rhs.start != undefined) {
      return Err(
        createError(
          isConstant(rhs.pin)
            ? `Constant bus cannot be subscripted`
            : `Internal pins (in this case: ${rhs.pin}) cannot be subscripted`,
          rhs.span
        )
      );
    }
    return Ok();
  }

  private validateInternalPins(): Result<void, CompilationError> {
    for (const [name, pinData] of this.internalPins) {
      if (!pinData.isDefined) {
        return Err(
          createError(
            name.toLowerCase() == "true" || name.toLowerCase() == "false"
              ? `The constants ${name.toLowerCase()} must be in lower-case`
              : `Undefined internal pin name: ${name}`,
            pinData.firstUse
          )
        );
      }
    }
    return Ok();
  }

  private validateWireWidths(): Result<void, CompilationError> {
    for (const wire of this.wires) {
      const lhsWidth =
        getSubBusWidth(wire.lhs) ?? wire.partChip.get(wire.lhs.pin)?.width;
      const rhsWidth =
        getSubBusWidth(wire.rhs) ??
        this.chip.get(wire.rhs.pin)?.width ??
        this.internalPins.get(wire.rhs.pin)?.width;
      if (lhsWidth != rhsWidth) {
        return Err(
          createError(
            `Different bus widths: ${display(
              wire.lhs
            )}(${lhsWidth}) and ${display(wire.rhs)}(${rhsWidth})`,
            {
              start: wire.lhs.span.start,
              end: wire.rhs.span.end,
              line: wire.lhs.span.line,
            }
          )
        );
      }
    }
    return Ok();
  }
}
