import { isErr, Ok, Result } from "@davidsouther/jiffies/result.js";
import { HdlParser } from "../../languages/hdl.js";
import { ParseError } from "../../languages/parser/base.js";
import { getBuiltinChip } from "./builtins/index.js";
import { Chip, Connection } from "./chip.js";

function pinWidth(start: number, end: number | undefined): number | undefined {
  if (end === undefined) {
    return undefined;
  }
  if (end >= start) {
    return end - start + 1;
  }
  if (start > 0 && end == 0) {
    return 1;
  }
  throw new Error(`Bus specification has start > end (${start} > ${end})`);
}

export function parse(code: string): Result<Chip, Error | ParseError> {
  const parsed = HdlParser(code);
  if (isErr(parsed)) return parsed;
  const [_, parts] = Ok(parsed);

  if (parts.parts === "BUILTIN") {
    return getBuiltinChip(parts.name);
  }

  const buildChip = new Chip(parts.ins, parts.outs, parts.name);

  for (const part of parts.parts) {
    const builtin = getBuiltinChip(part.name);
    if (isErr(builtin)) return builtin;
    const partChip = Ok(builtin);

    const wires = part.wires.map<Connection>(({ lhs, rhs }) => ({
      to: {
        name: lhs.pin,
        start: lhs.start ?? 0,
        width: pinWidth(lhs.start ?? 0, lhs.end),
      },
      from: {
        name: rhs.pin,
        start: rhs.start ?? 0,
        width: pinWidth(rhs.start ?? 0, rhs.end),
      },
    }));

    buildChip.wire(partChip, wires);
  }

  return Ok(buildChip);
}
