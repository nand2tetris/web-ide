import { isErr, Ok, Result } from "@davidsouther/jiffies/lib/esm/result";
import { HdlParse, HdlParser } from "../../languages/hdl";
import { ParseError, Span, StringLike } from "../../languages/parser/base";
import { getBuiltinChip } from "./builtins/index";
import { Chip, Connection } from "./chip";

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

export function parse(code: StringLike): Result<Chip, Error | ParseError> {
  const parsed = HdlParser(new Span(code));
  if (isErr(parsed)) return parsed;
  const [_, parts] = Ok(parsed);
  return build(parts);
}

export function build(parts: HdlParse): Result<Chip, Error> {
  if (parts.parts === "BUILTIN") {
    return getBuiltinChip(parts.name.value);
  }

  const buildChip = new Chip(
    parts.ins.map(({ pin: { value }, width }) => ({ pin: value, width })),
    parts.outs.map(({ pin: { value }, width }) => ({ pin: value, width })),
    parts.name.value
  );

  for (const part of parts.parts) {
    const builtin = getBuiltinChip(part.name.value);
    if (isErr(builtin)) return builtin;
    const partChip = Ok(builtin);

    const wires = part.wires.map<Connection>(({ lhs, rhs }) => ({
      to: {
        name: lhs.pin.value,
        start: lhs.start ?? 0,
        width: pinWidth(lhs.start ?? 0, lhs.end),
      },
      from: {
        name: rhs.pin.value,
        start: rhs.start ?? 0,
        width: pinWidth(rhs.start ?? 0, rhs.end),
      },
    }));

    buildChip.wire(partChip, wires);
  }

  return Ok(buildChip);
}
