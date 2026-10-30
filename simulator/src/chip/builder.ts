import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { Err, isErr, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  Diagnostic,
  Diagnostics,
  diagnostic,
  isValid,
  located,
  Span,
  semanticError,
  Valid,
} from "../languages/base.js";
import { HDL, HdlParse, Part, PinParts } from "../languages/hdl.js";
import { getBuiltinChip, hasBuiltinChip } from "./builtins/index.js";
import { Chip, Connection, isConstantPin } from "./chip.js";

function pinWidth(pin: PinParts): Result<number | undefined, Diagnostic> {
  const start = pin.start ?? 0;
  if (pin.end === undefined) {
    return Ok(undefined);
  }
  if (pin.end >= start) {
    return Ok(pin.end - start + 1);
  }
  return Err(semanticError("chip.busRange", {}, pin.span));
}

export async function parse(
  code: string,
  dir?: string,
  name?: string,
  fs?: FileSystem,
): Promise<Result<Chip, Diagnostics>> {
  const outcome = HDL.parse(code.toString());
  if (!isValid(outcome)) {
    return Err(outcome.diagnostics);
  }
  const chip = await build({ parts: outcome.ast, dir, name, fs });
  return isErr(chip) ? Err([Err(chip)]) : chip;
}

export async function loadChip(
  name: string,
  dir?: string,
  fs?: FileSystem,
): Promise<Result<Chip, Diagnostic>> {
  if (hasBuiltinChip(name) || fs === undefined) {
    return await getBuiltinChip(name);
  }
  try {
    const file = await fs.readFile(`${dir}/${name}.hdl`);
    const outcome = HDL.parse(file);
    if (!isValid(outcome)) {
      return Err(outcome.diagnostics[0]);
    }
    return await build({ parts: outcome.ast, dir, name, fs });
  } catch (_e) {
    return Err(diagnostic("chip.notLoaded", { file: `${name}.hdl` }));
  }
}

export async function build(
  ...args: Parameters<typeof ChipBuilder.build>
): Promise<ReturnType<typeof ChipBuilder.build>> {
  return await ChipBuilder.build(...args);
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
  rhs: PinParts,
): Result<Connection, Diagnostic> {
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
  assignedIndexes: Map<string, Set<number>>,
): Result<void, Diagnostic> {
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
      semanticError(
        "chip.multipleWrites",
        {
          pin: pin.pin,
          ...(errorIndex != -1 ? { index: errorIndex } : {}),
        },
        pin.span,
      ),
    );
  }
  return Ok();
}

class ChipBuilder {
  private parts: HdlParse;
  private fs?: FileSystem;
  private dir?: string;
  private expectedName?: string;

  private chip: Chip;
  private internalPins: Map<string, InternalPin> = new Map();
  private inPins: Map<string, Set<number>> = new Map();
  private outPins: Map<string, Set<number>> = new Map();
  private wires: WireData[] = [];

  static build(options: {
    parts: Valid<HdlParse>;
    fs?: FileSystem;
    dir?: string;
    name?: string;
  }) {
    return new ChipBuilder(options).build();
  }

  private constructor({
    parts,
    fs,
    dir,
    name,
  }: {
    parts: Valid<HdlParse>;
    fs?: FileSystem;
    dir?: string;
    name?: string;
  }) {
    this.parts = parts;
    this.expectedName = name;
    this.dir = dir;
    this.fs = fs;
    this.chip = new Chip(
      parts.ins.map(({ pin, width }) => ({ pin: pin.toString(), width })),
      parts.outs.map(({ pin, width }) => ({ pin: pin.toString(), width })),
      parts.name.value,
      [],
      parts.clocked,
    );
  }

  async build(): Promise<Result<Chip, Diagnostic>> {
    if (this.expectedName && this.parts.name.value != this.expectedName) {
      return Err(semanticError("chip.wrongName", {}, this.parts.name.span));
    }

    if (this.parts.parts === "BUILTIN") {
      return await getBuiltinChip(this.parts.name.value);
    }

    const result = await this.wireParts();
    if (isErr(result)) {
      return result;
    }

    this.chip.clockedPins = new Set(
      [...this.chip.ins.entries(), ...this.chip.outs.entries()]
        .map((pin) => pin.name)
        .filter((pin) => this.chip.isClockedPin(pin)),
    );

    // Reset clock order after wiring sub-pins
    for (const part of this.chip.parts) {
      part.subscribeToClock();
    }

    return Ok(this.chip);
  }

  private async wireParts(): Promise<Result<void, Diagnostic>> {
    if (this.parts.parts === "BUILTIN") {
      return Ok();
    }

    for (const part of this.parts.parts) {
      const builtin = await loadChip(part.name, this.dir, this.fs);
      if (isErr(builtin)) {
        return Err(
          semanticError("chip.notFound", { name: part.name }, part.span),
        );
      }
      const partChip = Ok(builtin);
      if (partChip.name == this.chip.name) {
        return Err(
          semanticError("chip.selfReference", { name: part.name }, part.span),
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

  private checkLoops(part: Part, partChip: Chip): Result<void, Diagnostic> {
    const ins = new Set<string>();
    const outs = new Set<string>();

    let loop: string | undefined = undefined;
    for (const { lhs, rhs } of part.wires) {
      if (partChip.isInPin(lhs.pin)) {
        if (outs.has(rhs.pin)) {
          loop = rhs.pin;
          break;
        } else {
          ins.add(rhs.pin);
        }
      } else if (partChip.isOutPin(lhs.pin)) {
        if (ins.has(rhs.pin)) {
          loop = rhs.pin;
          break;
        } else {
          outs.add(rhs.pin);
        }
      }
    }
    if (loop) {
      return Err(semanticError("chip.loopingWire", { pin: loop }, part.span));
    }
    return Ok();
  }

  private wirePart(part: Part, partChip: Chip): Result<void, Diagnostic> {
    const result = this.checkLoops(part, partChip);
    if (isErr(result)) {
      return result;
    }

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
          located(
            error.fault,
            error.lhs
              ? part.wires[error.wireIndex].lhs.span
              : part.wires[error.wireIndex].rhs.span,
            "semantic",
          ),
        );
      }
      this.chip.sortParts();
      return Ok();
    } catch (e) {
      return Err(
        semanticError(
          "error.unexpected",
          { message: (e as Error).message },
          part.span,
        ),
      );
    }
  }

  private validateWire(
    partChip: Chip,
    lhs: PinParts,
    rhs: PinParts,
  ): Result<void, Diagnostic> {
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
        semanticError("chip.undefinedPin", { pin: lhs.pin }, lhs.span),
      );
    }
    if (!isConstantPin(rhs.pin)) {
      this.wires.push({ partChip: partChip, lhs, rhs });
    }
    return Ok();
  }

  private validateInputWire(
    lhs: PinParts,
    rhs: PinParts,
  ): Result<void, Diagnostic> {
    let result = this.validateInputSource(rhs);
    if (isErr(result)) {
      return result;
    }
    result = checkMultipleAssignments(lhs, this.inPins);
    if (isErr(result)) {
      return result;
    }

    // track internal pin use to detect undefined pins
    if (this.chip.isInternalPin(rhs.pin)) {
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
    rhs: PinParts,
  ): Result<void, Diagnostic> {
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
          semanticError(
            "chip.internalPinSubscripted",
            { pin: rhs.pin },
            rhs.span,
          ),
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
            semanticError(
              "chip.internalPinRedefined",
              { pin: rhs.pin },
              rhs.span,
            ),
          );
        }
        pinData.isDefined = true;
        pinData.width = width;
      }
    }
    return Ok();
  }

  private validateWriteTarget(rhs: PinParts): Result<void, Diagnostic> {
    if (this.chip.isInPin(rhs.pin)) {
      return Err(
        semanticError("chip.writeToInput", { pin: rhs.pin }, rhs.span),
      );
    }
    if (isConstantPin(rhs.pin)) {
      return Err(semanticError("chip.internalPinReserved", {}, rhs.span));
    }
    return Ok();
  }

  private validateInputSource(rhs: PinParts): Result<void, Diagnostic> {
    if (this.chip.isOutPin(rhs.pin)) {
      return Err(semanticError("chip.outputAsInput", {}, rhs.span));
    } else if (!this.chip.isInPin(rhs.pin) && rhs.start != undefined) {
      return Err(
        isConstantPin(rhs.pin)
          ? semanticError("chip.constantSubscripted", {}, rhs.span)
          : semanticError(
              "chip.internalPinSubscripted",
              { pin: rhs.pin },
              rhs.span,
            ),
      );
    }
    return Ok();
  }

  private validateInternalPins(): Result<void, Diagnostic> {
    for (const [name, pinData] of this.internalPins) {
      if (!pinData.isDefined) {
        return Err(
          name.toLowerCase() == "true" || name.toLowerCase() == "false"
            ? semanticError(
                "chip.constantCase",
                { name: name.toLowerCase() },
                pinData.firstUse,
              )
            : semanticError(
                "chip.undefinedInternalPin",
                { name },
                pinData.firstUse,
              ),
        );
      }
    }
    return Ok();
  }

  private validateWireWidths(): Result<void, Diagnostic> {
    for (const wire of this.wires) {
      const lhsWidth =
        getSubBusWidth(wire.lhs) ?? wire.partChip.get(wire.lhs.pin)?.width;
      const rhsWidth =
        getSubBusWidth(wire.rhs) ??
        this.chip.get(wire.rhs.pin)?.width ??
        this.internalPins.get(wire.rhs.pin)?.width;
      if (lhsWidth != rhsWidth) {
        return Err(
          semanticError(
            "chip.busWidthMismatch",
            {
              lhs: display(wire.lhs),
              lhsWidth,
              rhs: display(wire.rhs),
              rhsWidth,
            },
            {
              start: wire.lhs.span.start,
              end: wire.rhs.span.end,
              line: wire.lhs.span.line,
            },
          ),
        );
      }
    }
    return Ok();
  }
}
