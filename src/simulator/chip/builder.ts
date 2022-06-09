import { isErr, Ok, Result } from "@davidsouther/jiffies/result.js";
import { HdlParser, PinParts } from "../../languages/hdl.js";
import { ParseError } from "../../languages/parser/base.js";
import { getBuiltinChip } from "./builtins/index.js";
import { Bus, Chip, Connection, InSubBus, OutSubBus, Pin } from "./chip.js";

export function parse(code: string): Result<Chip, Error | ParseError> {
  const parsed = HdlParser(code);
  if (isErr(parsed)) return parsed;
  const [_, parts] = Ok(parsed);

  if (parts.parts === "BUILTIN") {
    return getBuiltinChip(parts.name);
  }

  const ins = parts.ins.map(({ pin, start }) => ({
    pin,
    start: start == 0 ? 1 : start,
  }));
  const outs = parts.outs.map(({ pin, start }) => ({
    pin,
    start: start == 0 ? 1 : start,
  }));

  const buildChip = new Chip(ins, outs, parts.name);

  for (const part of parts.parts) {
    const builtin = getBuiltinChip(part.name);
    if (isErr(builtin)) return builtin;
    const partChip = Ok(builtin);

    const wires = part.wires.map<Connection>(({ lhs, rhs }) => {
      const toPin = {
        name: lhs.pin,
        start: lhs.start,
        width: lhs.end - lhs.start + 1,
      };
      const fromPin = {
        name: rhs.pin,
        start: rhs.start,
        width: rhs.end - rhs.start + 1,
      };

      return { to: toPin, from: fromPin };
    });

    buildChip.wire(partChip, wires);
  }

  return Ok(buildChip);
}
