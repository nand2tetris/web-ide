import { FileSystem } from "@davidsouther/jiffies/fs.ts";
import { Err, isErr, Ok, Result } from "@davidsouther/jiffies/result.ts";
import {
  Diagnostic,
  DiagnosticArgs,
  DiagnosticCode,
  Diagnostics,
  diagnostic,
  located,
  mergeByFile,
  Origin,
  Provenance,
  recoveredOf,
  Span,
  semanticError,
  skipsAny,
  Valid,
} from "../languages/base.js";
import {
  HDL,
  HdlParse,
  HdlSkipKind,
  Part,
  PinParts,
  prune,
} from "../languages/hdl.js";
import { builtinOverrides } from "./builtins/builtinOverrides.js";
import { hasBuiltinChip, REGISTRY } from "./builtins/index.js";
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

/** A chip's and its dependencies' diagnostics, keyed by source file. */
export type ChipDiagnostics = Record<string, Diagnostics>;

/** Options of the HDL final calls. */
export interface ChipOptions {
  /** Recover from syntax errors to keep checking. Default true. */
  attemptRecovery?: boolean;
}

/** The key of a root source with no name. */
const INPUT_KEY = "<input>.hdl";

/** The source key of chip `name` in `dir`: the path a dependency is read from. */
function fileKeyOf(dir: string | undefined, name: string): string {
  return [dir, `${name}.hdl`].filter(Boolean).join("/");
}

/** The key of a root source: the path of `name` in `dir`, or `<input>.hdl`. */
function rootKeyOf(dir: string | undefined, name: string | undefined): string {
  return name === undefined ? INPUT_KEY : fileKeyOf(dir, name);
}

/**
 * Builds a chip from HDL source, reporting the diagnostics of the source and
 * of every dependency it loads, each under its source key. Any diagnostic
 * withholds the chip.
 */
export async function parse(
  code: string,
  dir?: string,
  name?: string,
  fs?: FileSystem,
  options?: ChipOptions & { file?: string },
): Promise<Result<Chip, ChipDiagnostics>> {
  const file = options?.file ?? rootKeyOf(dir, name);
  const files = new FileDiagnostics();
  const { chip } = await loadSource(
    code.toString(),
    file,
    { dir, name },
    { fs, attemptRecovery: options?.attemptRecovery ?? true, files },
  );
  return files.result(file, chip);
}

/**
 * Loads chip `name` as a part would: a builtin, or `name.hdl` in `dir`. A
 * source that cannot be read reports a spanless diagnostic under its key.
 */
export async function loadChip(
  name: string,
  dir?: string,
  fs?: FileSystem,
  options?: ChipOptions,
): Promise<Result<Chip, ChipDiagnostics>> {
  const files = new FileDiagnostics();
  const { chip } = await loadDependency(name, dir, {
    fs,
    attemptRecovery: options?.attemptRecovery ?? true,
    files,
  });
  return files.result(fileKeyOf(dir, name), chip);
}

/**
 * Builds a chip from a valid tree. Dependencies parse without recovery unless
 * `attemptRecovery` is set; `provenance` is what pruning dropped from `parts`.
 */
export async function build(options: {
  parts: Valid<HdlParse>;
  provenance?: Provenance;
  fs?: FileSystem;
  dir?: string;
  name?: string;
  attemptRecovery?: boolean;
  file?: string;
}): Promise<Result<Chip, ChipDiagnostics>> {
  const { parts, provenance = [], fs, dir, name } = options;
  const file = options.file ?? rootKeyOf(dir, name);
  const files = new FileDiagnostics();
  const chip = await new ChipBuilder({
    ast: parts,
    provenance,
    dir,
    name,
    file,
    context: { fs, attemptRecovery: options.attemptRecovery ?? false, files },
  }).build();
  return files.result(file, chip);
}

/** Diagnostics gathered while loading a chip and its dependencies, by file. */
class FileDiagnostics {
  private readonly lists = new Map<string, Diagnostic[]>();
  private readonly origins = new Map<Diagnostic, Origin>();

  add(file: string, ...diagnostics: readonly Diagnostic[]) {
    if (diagnostics.length > 0) {
      this.lists.set(file, [...(this.lists.get(file) ?? []), ...diagnostics]);
    }
  }

  /** Keeps each skip's recovery identity, so distinct skips stay apart. */
  addProvenance(provenance: Provenance) {
    for (const { diagnostic, key } of provenance) {
      if (key !== undefined) {
        this.origins.set(diagnostic, { recovery: key });
      }
    }
  }

  /**
   * The chip when no file has a diagnostic; otherwise every file's merged
   * list and no chip. Without a chip, `file` reports that nothing loaded.
   */
  result(file: string, chip: Chip | undefined): Result<Chip, ChipDiagnostics> {
    if (this.lists.size === 0) {
      if (chip !== undefined) {
        return Ok(chip);
      }
      this.add(file, diagnostic("chip.notLoaded", { file }));
    }
    const files: Record<string, Diagnostics> = {};
    for (const [key, [first, ...rest]] of this.lists) {
      files[key] = [first, ...rest];
    }
    return Err(mergeByFile(files, this.origins));
  }
}

/** What one load shares with the loads of its dependencies. */
interface LoadContext {
  readonly fs?: FileSystem;
  readonly attemptRecovery: boolean;
  readonly files: FileDiagnostics;
}

/**
 * A chip loaded for a caller. `chip` is built from the pruned tree even when
 * its source has diagnostics, so the caller can check its parts against the
 * intact declarations; it is undefined when the source built no tree or was
 * not found. `provenance` is what pruning dropped.
 */
interface Loaded {
  readonly chip?: Chip;
  readonly provenance: Provenance;
  /** No source was found, so the referring part names an undefined chip. */
  readonly missing?: true;
}

/** Parses and builds one source, reporting its diagnostics under `file`. */
async function loadSource(
  code: string,
  file: string,
  { dir, name }: { dir?: string; name?: string },
  context: LoadContext,
): Promise<Loaded> {
  const outcome = HDL.parse(code, {
    attemptRecovery: context.attemptRecovery,
  });
  context.files.add(file, ...outcome.diagnostics);
  const recovered = recoveredOf(outcome, prune);
  if (recovered === undefined) {
    return { provenance: [] };
  }
  context.files.addProvenance(recovered.provenance);
  const chip = await new ChipBuilder({
    ...recovered,
    dir,
    name,
    file,
    context,
  }).build();
  return { chip, provenance: recovered.provenance };
}

/** Loads the chip a part names: a builtin, or its source in `dir`. */
async function loadDependency(
  name: string,
  dir: string | undefined,
  context: LoadContext,
): Promise<Loaded> {
  const { fs } = context;
  if (hasBuiltinChip(name) || fs === undefined) {
    return loadBuiltin(name, context);
  }
  const file = fileKeyOf(dir, name);
  let code: string;
  try {
    code = await fs.readFile(file);
  } catch (_e) {
    return { provenance: [], missing: true };
  }
  return loadSource(code, file, { dir, name }, context);
}

/**
 * Loads a builtin chip. An overridden builtin builds from its HDL, whose
 * diagnostics report under `builtin:Name.hdl`.
 */
async function loadBuiltin(
  name: string,
  context: LoadContext,
): Promise<Loaded> {
  if (Object.hasOwn(builtinOverrides, name)) {
    return loadSource(
      builtinOverrides[name],
      `builtin:${name}.hdl`,
      { name },
      { ...context, fs: undefined },
    );
  }
  const chip = REGISTRY.get(name)?.();
  return chip === undefined
    ? { provenance: [], missing: true }
    : { chip, provenance: [] };
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

/**
 * Skipped nodes that could supply a chip's own pin: a skipped part could
 * drive it, and a skipped `IN` or `OUT` line could declare it.
 */
const SUPPLIES_OWN_PIN: ReadonlySet<string> = new Set<HdlSkipKind>([
  "ChipStart",
  "InListBody",
  "OutListBody",
  "PartBody",
  "PartsClose",
  "ChipClose",
]);

/** Skipped nodes that could declare a pin of a chip used as a part. */
const DECLARES_PIN: ReadonlySet<string> = new Set<HdlSkipKind>([
  "ChipStart",
  "InListBody",
  "OutListBody",
]);

/** Skipped nodes that could name their chip. */
const NAMES_CHIP: ReadonlySet<string> = new Set<HdlSkipKind>([
  "ChipHead",
  "ChipStart",
]);

class ChipBuilder {
  private parts: Valid<HdlParse>;
  private provenance: Provenance;
  private dir?: string;
  private expectedName?: string;
  private file: string;
  private context: LoadContext;

  private chip: Chip;
  /**
   * True when recovery skipped the header that names this chip. The chip
   * then takes the name it loads as, and checks of its name are suppressed.
   */
  private unnamed: boolean;
  private name: string;
  private internalPins: Map<string, InternalPin> = new Map();
  private inPins: Map<string, Set<number>> = new Map();
  private outPins: Map<string, Set<number>> = new Map();
  private wires: WireData[] = [];
  /** Pins a wire of unknown direction names: an unresolved part could drive them. */
  private mayBeDriven = new Set<string>();
  /** True once this chip has a diagnostic of its own. */
  private failed = false;

  constructor({
    ast,
    provenance,
    dir,
    name,
    file,
    context,
  }: {
    ast: Valid<HdlParse>;
    provenance: Provenance;
    dir?: string;
    name?: string;
    file: string;
    context: LoadContext;
  }) {
    this.parts = ast;
    this.provenance = provenance;
    this.expectedName = name;
    this.dir = dir;
    this.file = file;
    this.context = context;
    this.unnamed = skipsAny(provenance, NAMES_CHIP);
    this.name = this.unnamed ? (name ?? "") : ast.name.value;
    this.chip = new Chip(
      ast.ins.map(({ pin, width }) => ({ pin: pin.toString(), width })),
      ast.outs.map(({ pin, width }) => ({ pin: pin.toString(), width })),
      this.name,
      [],
      ast.clocked,
    );
  }

  private fail(diagnostic: Diagnostic) {
    this.failed = true;
    this.context.files.add(this.file, diagnostic);
  }

  private report<C extends DiagnosticCode>(
    code: C,
    args: DiagnosticArgs[C],
    span?: Span,
  ) {
    this.fail(semanticError(code, args, span));
  }

  /**
   * The chip, reporting its diagnostics under its file. A chip with
   * diagnostics is for its callers' checks only.
   */
  async build(): Promise<Chip> {
    // Suppressed: a wrong chip name, when recovery skipped the header that
    // names the chip.
    if (
      !this.unnamed &&
      this.expectedName &&
      this.parts.name.value != this.expectedName
    ) {
      // The source is not the chip asked for, so its parts are not loaded:
      // a chip that names itself as a part must not load itself forever.
      this.report("chip.wrongName", {}, this.parts.name.span);
      return this.chip;
    }

    if (this.parts.parts === "BUILTIN") {
      const builtin = await loadBuiltin(this.name, this.context);
      // Suppressed: a builtin missing from the registry, when recovery
      // skipped the header that names it.
      if (builtin.missing && !this.unnamed) {
        this.report(
          "chip.notBuiltin",
          { name: this.name },
          this.parts.name.span,
        );
      }
      return builtin.chip ?? this.chip;
    }

    await this.wireParts();
    if (this.failed) {
      // A chip with diagnostics may hold a part loop; clock analysis would
      // not finish. Callers check their parts only against its pins.
      return this.chip;
    }

    this.chip.clockedPins = new Set(
      [...this.chip.ins.entries(), ...this.chip.outs.entries()]
        .map((pin) => pin.name)
        .filter((pin) => this.chip.isClockedPin(pin)),
    );

    for (const part of this.chip.parts) {
      part.subscribeToClock();
    }

    return this.chip;
  }

  private async wireParts() {
    if (this.parts.parts === "BUILTIN") {
      return;
    }

    for (const part of this.parts.parts) {
      const loaded = await loadDependency(part.name, this.dir, this.context);
      if (loaded.chip === undefined) {
        // A dependency read but built with no tree reports under its file.
        if (loaded.missing) {
          this.report("chip.notFound", { name: part.name }, part.span);
        }
        this.mayDrive(part);
        continue;
      }
      const partChip = loaded.chip;
      if (partChip.name == this.chip.name) {
        this.report(
          "chip.selfReference",
          { name: String(partChip.name) },
          part.span,
        );
        this.mayDrive(part);
        continue;
      }
      this.wirePart(part, partChip, loaded.provenance);
    }
    this.validateInternalPins();
    // Checked last because the width of an internal pin is known only once
    // every part is wired.
    this.validateWireWidths();
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

  /** Records the pins of a part whose chip is unknown as possibly driven. */
  private mayDrive(part: Part) {
    for (const { rhs } of part.wires) {
      this.mayBeDriven.add(rhs.pin);
    }
  }

  /** Wires a part whose every wire is valid, reporting each invalid wire. */
  private wirePart(part: Part, partChip: Chip, partProvenance: Provenance) {
    const loop = this.checkLoops(part, partChip);
    if (isErr(loop)) {
      this.fail(Err(loop));
    }

    const connections: Connection[] = [];
    let valid = true;
    this.inPins.clear();
    for (const { lhs, rhs } of part.wires) {
      if (!partChip.isInPin(lhs.pin) && !partChip.isOutPin(lhs.pin)) {
        // Suppressed: an undefined pin when the part's chip skipped an `IN`
        // or `OUT` line that could have declared it. Its direction is then
        // unknown, so its pin may be driven.
        if (!skipsAny(partProvenance, DECLARES_PIN)) {
          this.report("chip.undefinedPin", { pin: lhs.pin }, lhs.span);
        }
        this.mayBeDriven.add(rhs.pin);
        valid = false;
        continue;
      }
      const connection = this.connect(partChip, lhs, rhs);
      if (isErr(connection)) {
        this.fail(Err(connection));
        valid = false;
      } else {
        connections.push(Ok(connection));
      }
    }
    if (!valid) {
      return;
    }

    try {
      const result = this.chip.wire(partChip, connections);
      if (isErr(result)) {
        const error = Err(result);
        this.fail(
          located(
            error.fault,
            error.lhs
              ? part.wires[error.wireIndex].lhs.span
              : part.wires[error.wireIndex].rhs.span,
            "semantic",
          ),
        );
        return;
      }
      this.chip.sortParts();
    } catch (e) {
      this.report(
        "error.unexpected",
        { message: (e as Error).message },
        part.span,
      );
    }
  }

  /** One wire's connection, once the wire is valid. */
  private connect(
    partChip: Chip,
    lhs: PinParts,
    rhs: PinParts,
  ): Result<Connection, Diagnostic> {
    const result = this.validateWire(partChip, lhs, rhs);
    return isErr(result) ? result : createConnection(lhs, rhs);
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

  /**
   * Suppressed: an undefined internal pin that a skipped part, `IN` line or
   * `OUT` line could have driven or declared, or that only a part of unknown
   * chip or pins could drive. A file holds one chip, so its provenance is
   * that chip's scope.
   */
  private validateInternalPins() {
    if (skipsAny(this.provenance, SUPPLIES_OWN_PIN)) {
      return;
    }
    for (const [name, pinData] of this.internalPins) {
      if (!pinData.isDefined && !this.mayBeDriven.has(name)) {
        if (name.toLowerCase() == "true" || name.toLowerCase() == "false") {
          this.report(
            "chip.constantCase",
            { name: name.toLowerCase() },
            pinData.firstUse,
          );
        } else {
          this.report("chip.undefinedInternalPin", { name }, pinData.firstUse);
        }
      }
    }
  }

  private validateWireWidths() {
    for (const wire of this.wires) {
      // An undriven internal pin has no width to compare.
      if (this.internalPins.get(wire.rhs.pin)?.isDefined === false) {
        continue;
      }
      const lhsWidth =
        getSubBusWidth(wire.lhs) ?? wire.partChip.get(wire.lhs.pin)?.width;
      const rhsWidth =
        getSubBusWidth(wire.rhs) ??
        this.chip.get(wire.rhs.pin)?.width ??
        this.internalPins.get(wire.rhs.pin)?.width;
      if (lhsWidth != rhsWidth) {
        this.report(
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
        );
      }
    }
  }
}
