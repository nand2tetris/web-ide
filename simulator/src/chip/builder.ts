import {
  Err,
  isErr,
  Ok,
  Result,
} from "@davidsouther/jiffies/lib/esm/result.js";
import { HDL, HdlParse } from "../languages/hdl.js";
import { getBuiltinChip } from "./builtins/index.js";
import { Chip, Connection } from "./chip.js";

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

export function parse(
  code: string
): Result<Chip, Error | { message: string; shortMessage: string }> {
  const parsed = HDL.parse(code.toString());
  if (isErr(parsed)) return parsed;
  return build(Ok(parsed));
}

export function build(parts: HdlParse): Result<Chip, Error> {
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

  for (const part of parts.parts) {
    const builtin = getBuiltinChip(part.name.toString());
    if (isErr(builtin)) return builtin;
    const partChip = Ok(builtin);

    const wires = part.wires.map<Connection>(({ lhs, rhs }) => ({
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
    }));

    try {
      buildChip.wire(partChip, wires);
    } catch (e) {
      return Err(e as Error);
    }
  }

  return Ok(buildChip);
}
